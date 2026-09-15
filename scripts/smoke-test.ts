import { config } from "dotenv"
config({ path: ".env.local" })

import { db } from "../lib/db"
import { users, events, registrations, registrationMembers } from "../lib/db/schema"
import { hashPassword, verifyPassword } from "../lib/auth/password"
import { createSessionToken, verifySessionToken } from "../lib/auth/session"
import { generateEventSlug } from "../lib/utils/slug"
import { deriveTicketPrefix, generateTicketCode } from "../lib/utils/ticket"
import { isUniqueConstraintViolation } from "../lib/db/errors"
import { eq } from "drizzle-orm"

let failures = 0
function check(label: string, condition: boolean) {
  console.log(`${condition ? "PASS" : "FAIL"} - ${label}`)
  if (!condition) failures++
}

async function main() {
  console.log("=== Auth: password hashing ===")
  const hash = await hashPassword("supersecret123")
  check("hash is not the plaintext password", hash !== "supersecret123")
  check("correct password verifies", await verifyPassword("supersecret123", hash))
  check("wrong password fails", !(await verifyPassword("wrongpassword", hash)))

  console.log("=== Auth: session tokens ===")
  const fakeUserId = "11111111-1111-1111-1111-111111111111"
  const token = await createSessionToken({ userId: fakeUserId })
  const verified = await verifySessionToken(token)
  check("session token round-trips", verified?.userId === fakeUserId)
  check("tampered token is rejected", (await verifySessionToken(token + "x")) === null)

  console.log("=== Host signup (real DB insert) ===")
  const testEmail = `smoketest-${Date.now()}@example.com`
  const [host] = await db
    .insert(users)
    .values({ name: "Smoke Test Host", email: testEmail, passwordHash: hash })
    .returning()
  check("host user created", !!host?.id)

  console.log("=== Event creation ===")
  const title = "Smoke Test Christmas Party"
  const slug = generateEventSlug(title)
  const ticketPrefix = deriveTicketPrefix(title)
  check("slug is url-safe", /^[a-z0-9-]+$/.test(slug))
  check("ticket prefix derived", ticketPrefix === "SMOKE")

  const [event] = await db
    .insert(events)
    .values({
      hostId: host.id,
      slug,
      title,
      eventDate: "2026-12-20",
      eventTime: "18:00",
      themeColor: "christmas-red",
      ticketPrefix,
      status: "open",
    })
    .returning()
  check("event created and open", event?.status === "open")

  console.log('=== Guest registration, including a member named literally "0" ===')
  const ticketCode = generateTicketCode(event.ticketPrefix)
  const [registration] = await db
    .insert(registrations)
    .values({
      eventId: event.id,
      registrantName: "Test Family",
      email: "guest@example.com",
      ticketCode,
    })
    .returning()
  check("registration inserted as pending", registration?.status === "pending")

  await db.insert(registrationMembers).values([
    { registrationId: registration.id, name: "Juan", sortOrder: 0 },
    { registrationId: registration.id, name: "0", sortOrder: 1 }, // the old PHP bug case
  ])

  const members = await db
    .select()
    .from(registrationMembers)
    .where(eq(registrationMembers.registrationId, registration.id))
  check("both members saved (2 rows)", members.length === 2)
  check('member literally named "0" was NOT dropped (old PHP bug)', members.some((m) => m.name === "0"))

  console.log("=== Duplicate email for same event should be rejected by the DB constraint ===")
  let duplicateRejected = false
  try {
    await db.insert(registrations).values({
      eventId: event.id,
      registrantName: "Duplicate Family",
      email: "guest@example.com", // same email, same event
      ticketCode: generateTicketCode(event.ticketPrefix),
    })
  } catch (error) {
    duplicateRejected = isUniqueConstraintViolation(error, "registrations_event_email_idx")
  }
  check("duplicate email correctly rejected by unique constraint", duplicateRejected)

  console.log("=== Approve the registration ===")
  await db
    .update(registrations)
    .set({ status: "approved", decidedAt: new Date() })
    .where(eq(registrations.id, registration.id))
  const [approved] = await db.select().from(registrations).where(eq(registrations.id, registration.id))
  check("registration is now approved", approved?.status === "approved")

  console.log("=== Cleanup ===")
  await db.delete(events).where(eq(events.id, event.id)) // cascades to registrations + members
  await db.delete(users).where(eq(users.id, host.id))
  const [stillThere] = await db.select().from(events).where(eq(events.id, event.id))
  check("event + cascade cleanup worked", !stillThere)

  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error("Smoke test crashed:", error)
  process.exit(1)
})
