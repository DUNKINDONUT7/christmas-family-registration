import "server-only"
import { count, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users, events, registrations } from "@/lib/db/schema"

export async function getPlatformStats() {
  const [[{ totalUsers }], [{ totalEvents }], [{ totalRegistrations }]] = await Promise.all([
    db.select({ totalUsers: count() }).from(users),
    db.select({ totalEvents: count() }).from(events),
    db.select({ totalRegistrations: count() }).from(registrations),
  ])

  return { totalUsers, totalEvents, totalRegistrations }
}

export interface AdminEventRow {
  id: string
  title: string
  slug: string
  status: "draft" | "open" | "closed"
  eventDate: string
  createdAt: Date
  hostName: string
  hostEmail: string
  registrationCount: number
}

export async function getAllEventsForAdmin(): Promise<AdminEventRow[]> {
  const registrationCounts = await db
    .select({ eventId: registrations.eventId, total: count() })
    .from(registrations)
    .groupBy(registrations.eventId)

  const countByEvent = new Map(registrationCounts.map((r) => [r.eventId, r.total]))

  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      slug: events.slug,
      status: events.status,
      eventDate: events.eventDate,
      createdAt: events.createdAt,
      hostName: users.name,
      hostEmail: users.email,
    })
    .from(events)
    .innerJoin(users, eq(events.hostId, users.id))
    .orderBy(desc(events.createdAt))

  return rows.map((row) => ({ ...row, registrationCount: countByEvent.get(row.id) ?? 0 }))
}

export interface AdminUserRow {
  id: string
  name: string
  email: string
  platformRole: "user" | "admin"
  createdAt: Date
  eventCount: number
}

export async function getAllUsersForAdmin(): Promise<AdminUserRow[]> {
  const eventCounts = await db.select({ hostId: events.hostId, total: count() }).from(events).groupBy(events.hostId)
  const countByUser = new Map(eventCounts.map((r) => [r.hostId, r.total]))

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      platformRole: users.platformRole,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))

  return rows.map((row) => ({ ...row, eventCount: countByUser.get(row.id) ?? 0 }))
}
