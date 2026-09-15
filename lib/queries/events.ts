import "server-only"
import { and, count, desc, eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { events, eventCollaborators, registrations, type Event } from "@/lib/db/schema"

export interface EventWithCounts extends Event {
  pendingCount: number
  approvedCount: number
  totalCount: number
}

async function attachGuestCounts(eventList: Event[]): Promise<EventWithCounts[]> {
  if (eventList.length === 0) return []

  const eventIds = eventList.map((e) => e.id)
  const rows = await db
    .select({ eventId: registrations.eventId, status: registrations.status, total: count() })
    .from(registrations)
    .where(inArray(registrations.eventId, eventIds))
    .groupBy(registrations.eventId, registrations.status)

  const countsByEvent = new Map<string, { pending: number; approved: number; total: number }>()
  for (const row of rows) {
    const existing = countsByEvent.get(row.eventId) ?? { pending: 0, approved: 0, total: 0 }
    if (row.status === "pending") existing.pending += row.total
    if (row.status === "approved") existing.approved += row.total
    existing.total += row.total
    countsByEvent.set(row.eventId, existing)
  }

  return eventList.map((event) => {
    const c = countsByEvent.get(event.id) ?? { pending: 0, approved: 0, total: 0 }
    return { ...event, pendingCount: c.pending, approvedCount: c.approved, totalCount: c.total }
  })
}

export async function getHostDashboardData(userId: string) {
  const ownedEvents = await db.select().from(events).where(eq(events.hostId, userId)).orderBy(desc(events.createdAt))

  const collaboratingRows = await db
    .select({ event: events })
    .from(eventCollaborators)
    .innerJoin(events, eq(eventCollaborators.eventId, events.id))
    .where(eq(eventCollaborators.userId, userId))
    .orderBy(desc(events.createdAt))

  const [ownedWithCounts, collaboratingWithCounts] = await Promise.all([
    attachGuestCounts(ownedEvents),
    attachGuestCounts(collaboratingRows.map((r) => r.event)),
  ])

  return { ownedEvents: ownedWithCounts, collaboratingEvents: collaboratingWithCounts }
}

export async function getEventById(eventId: string) {
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1)
  return event ?? null
}

export async function getEventBySlug(slug: string) {
  const [event] = await db.select().from(events).where(eq(events.slug, slug)).limit(1)
  return event ?? null
}
