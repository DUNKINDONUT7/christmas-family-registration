import "server-only"
import { asc, desc, eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { registrations, registrationMembers, scheduleItems, eventCollaborators, users } from "@/lib/db/schema"
import type { Registration } from "@/lib/db/schema"

export interface RegistrationWithMembers extends Registration {
  members: string[]
}

export async function getEventRegistrations(eventId: string): Promise<RegistrationWithMembers[]> {
  const rows = await db
    .select()
    .from(registrations)
    .where(eq(registrations.eventId, eventId))
    .orderBy(desc(registrations.registeredAt))

  if (rows.length === 0) return []

  const memberRows = await db
    .select()
    .from(registrationMembers)
    .where(inArray(registrationMembers.registrationId, rows.map((r) => r.id)))
    .orderBy(asc(registrationMembers.sortOrder))

  const membersByRegistration = new Map<string, string[]>()
  for (const m of memberRows) {
    const list = membersByRegistration.get(m.registrationId) ?? []
    list.push(m.name)
    membersByRegistration.set(m.registrationId, list)
  }

  return rows.map((r) => ({ ...r, members: membersByRegistration.get(r.id) ?? [] }))
}

export async function getEventScheduleItems(eventId: string) {
  return db.select().from(scheduleItems).where(eq(scheduleItems.eventId, eventId)).orderBy(asc(scheduleItems.sortOrder))
}

export async function getRegistrationById(registrationId: string): Promise<RegistrationWithMembers | null> {
  const [registration] = await db.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1)
  if (!registration) return null

  const memberRows = await db
    .select()
    .from(registrationMembers)
    .where(eq(registrationMembers.registrationId, registrationId))
    .orderBy(asc(registrationMembers.sortOrder))

  return { ...registration, members: memberRows.map((m) => m.name) }
}

export async function getEventCollaborators(eventId: string) {
  return db
    .select({ userId: users.id, name: users.name, email: users.email, acceptedAt: eventCollaborators.acceptedAt })
    .from(eventCollaborators)
    .innerJoin(users, eq(eventCollaborators.userId, users.id))
    .where(eq(eventCollaborators.eventId, eventId))
    .orderBy(asc(eventCollaborators.acceptedAt))
}
