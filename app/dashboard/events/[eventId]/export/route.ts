import { eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { events, registrations, registrationMembers } from "@/lib/db/schema"
import { getEventRole } from "@/lib/auth/event-access"
import { getCurrentUser } from "@/lib/auth/dal"
import { toCsv } from "@/lib/utils/csv"

export async function GET(_request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params

  const user = await getCurrentUser()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const role = await getEventRole(eventId, user.id, user.platformRole === "admin")
  if (!role) {
    return new Response("Not found", { status: 404 })
  }

  const [event] = await db.select({ title: events.title }).from(events).where(eq(events.id, eventId)).limit(1)
  if (!event) {
    return new Response("Not found", { status: 404 })
  }

  const rows = await db.select().from(registrations).where(eq(registrations.eventId, eventId))

  const memberRows = rows.length
    ? await db
        .select()
        .from(registrationMembers)
        .where(inArray(registrationMembers.registrationId, rows.map((r) => r.id)))
    : []

  const membersByRegistration = new Map<string, string[]>()
  for (const m of memberRows) {
    const list = membersByRegistration.get(m.registrationId) ?? []
    list.push(m.name)
    membersByRegistration.set(m.registrationId, list)
  }

  const csv = toCsv(
    ["Registrant", "Email", "Phone", "Status", "Ticket Code", "Members", "Member Count", "Registered At"],
    rows.map((r) => [
      r.registrantName,
      r.email,
      r.phone ?? "",
      r.status,
      r.ticketCode,
      (membersByRegistration.get(r.id) ?? []).join("; "),
      String((membersByRegistration.get(r.id) ?? []).length),
      r.registeredAt.toISOString(),
    ])
  )

  const filename = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-guests.csv`

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
