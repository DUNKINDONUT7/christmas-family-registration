import "server-only"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { events, eventCollaborators } from "@/lib/db/schema"
import { requireUser } from "@/lib/auth/dal"

export type EventRole = "owner" | "collaborator"

/**
 * Returns the current user's role on an event, or null if they have no
 * access at all. "owner" can do everything, including destructive/
 * settings changes and inviting collaborators. "collaborator" can
 * manage guests and the schedule, but not delete the event, change
 * settings, or invite further collaborators.
 */
export async function getEventRole(eventId: string, userId: string): Promise<EventRole | null> {
  const [event] = await db
    .select({ hostId: events.hostId })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  if (!event) return null
  if (event.hostId === userId) return "owner"

  const [collaborator] = await db
    .select({ id: eventCollaborators.id })
    .from(eventCollaborators)
    .where(and(eq(eventCollaborators.eventId, eventId), eq(eventCollaborators.userId, userId)))
    .limit(1)

  return collaborator ? "collaborator" : null
}

/** Both owner and collaborator may manage guests/schedule. */
export function canManageEvent(role: EventRole | null): boolean {
  return role === "owner" || role === "collaborator"
}

/** Only the owner may change settings, delete the event, or invite collaborators. */
export function canAdministerEvent(role: EventRole | null): boolean {
  return role === "owner"
}

/**
 * Convenience guard for Server Actions: loads the current user, checks
 * their role on the event, and returns either the resolved role or a
 * ready-to-return ActionResult error — so callers can do:
 *
 *   const auth = await authorizeEventAction(eventId, "owner")
 *   if (!auth.ok) return auth.result
 */
export async function authorizeEventAction(
  eventId: string,
  requiredRole: "owner" | "any"
): Promise<{ ok: true; role: EventRole; userId: string } | { ok: false; result: { success: false; message: string } }> {
  const user = await requireUser()
  const role = await getEventRole(eventId, user.id)

  if (!role) {
    return { ok: false, result: { success: false, message: "You don't have access to this event." } }
  }
  if (requiredRole === "owner" && role !== "owner") {
    return { ok: false, result: { success: false, message: "Only the event owner can do that." } }
  }

  return { ok: true, role, userId: user.id }
}
