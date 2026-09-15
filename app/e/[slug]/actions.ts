"use server"

import { redirect } from "next/navigation"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { events, registrations, registrationMembers } from "@/lib/db/schema"
import { generateTicketCode } from "@/lib/utils/ticket"
import { sendRegistrationReceivedEmail } from "@/lib/email"
import {
  registerForEventSchema,
  registrationStatusLookupSchema,
  type RegisterForEventInput,
} from "@/lib/validations/registration"
import { zodErrorToFieldErrors, type ActionResult } from "@/lib/action-result"
import type { z } from "zod"

const MAX_TICKET_RETRIES = 5

export async function registerForEventAction(input: RegisterForEventInput): Promise<ActionResult> {
  const parsed = registerForEventSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "Please fix the errors below.", fieldErrors: zodErrorToFieldErrors(parsed.error) }
  }

  const [event] = await db.select().from(events).where(eq(events.slug, parsed.data.slug)).limit(1)
  if (!event) {
    return { success: false, message: "This event doesn't exist or is no longer available." }
  }
  if (event.status !== "open") {
    return {
      success: false,
      message:
        event.status === "draft"
          ? "This event isn't open for registration yet."
          : "Registration for this event is closed.",
    }
  }

  const { registrantName, email, phone, members } = parsed.data
  const normalizedEmail = email.toLowerCase()

  let registrationId: string | null = null
  let ticketCode: string | null = null
  let lastError: unknown = null

  for (let attempt = 0; attempt < MAX_TICKET_RETRIES; attempt++) {
    const candidateTicketCode = generateTicketCode(event.ticketPrefix)
    try {
      const [inserted] = await db
        .insert(registrations)
        .values({
          eventId: event.id,
          registrantName,
          email: normalizedEmail,
          phone: phone || null,
          ticketCode: candidateTicketCode,
        })
        .returning({ id: registrations.id })
      registrationId = inserted.id
      ticketCode = candidateTicketCode
      break
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      // Email already used for this event — not a ticket collision, stop retrying.
      if (message.includes("registrations_event_email_idx")) {
        return {
          success: false,
          message: "This email is already registered for this event.",
          fieldErrors: { email: "Already registered for this event." },
        }
      }
      // Ticket code collision (extremely unlikely) — try again with a new code.
      if (message.includes("registrations_event_ticket_idx")) {
        continue
      }
      throw error
    }
  }

  if (!registrationId || !ticketCode) {
    console.error("Failed to generate a unique ticket code after retries:", lastError)
    return { success: false, message: "Something went wrong generating your ticket. Please try again." }
  }

  if (members.length > 0) {
    await db.insert(registrationMembers).values(
      members.map((name, index) => ({
        registrationId,
        name,
        sortOrder: index,
      }))
    )
  }

  await sendRegistrationReceivedEmail({
    to: normalizedEmail,
    registrantName,
    eventTitle: event.title,
    ticketCode,
    statusCheckUrl: `${process.env.NEXT_PUBLIC_APP_URL}/e/${event.slug}/status`,
  })

  redirect(`/e/${event.slug}/confirmation/${registrationId}`)
}

export async function lookupRegistrationStatusAction(
  input: z.infer<typeof registrationStatusLookupSchema>
): Promise<ActionResult<{ registrationId: string }>> {
  const parsed = registrationStatusLookupSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "Please fix the errors below.", fieldErrors: zodErrorToFieldErrors(parsed.error) }
  }

  const [event] = await db.select({ id: events.id }).from(events).where(eq(events.slug, parsed.data.slug)).limit(1)
  if (!event) return { success: false, message: "Event not found." }

  // Ticket codes are always generated upper-case; email is always stored
  // lower-case — normalize user input the same way before matching.
  const [found] = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, event.id),
        eq(registrations.email, parsed.data.email.toLowerCase()),
        eq(registrations.ticketCode, parsed.data.ticketCode.toUpperCase())
      )
    )
    .limit(1)

  if (!found) {
    return { success: false, message: "We couldn't find a registration matching that email and ticket code." }
  }

  return { success: true, data: { registrationId: found.id } }
}
