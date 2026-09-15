"use server"

import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { collaboratorInvites, eventCollaborators, events } from "@/lib/db/schema"
import { requireUser } from "@/lib/auth/dal"
import { hashToken } from "@/lib/utils/token"
import type { ActionResult } from "@/lib/action-result"

export async function acceptInviteAction(rawToken: string): Promise<ActionResult<{ eventId: string }>> {
  const user = await requireUser()
  const tokenHash = hashToken(rawToken)

  const [invite] = await db.select().from(collaboratorInvites).where(eq(collaboratorInvites.tokenHash, tokenHash)).limit(1)

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return { success: false, message: "This invite link is invalid or has expired." }
  }

  const [event] = await db.select({ hostId: events.hostId }).from(events).where(eq(events.id, invite.eventId)).limit(1)
  if (!event) {
    return { success: false, message: "This event no longer exists." }
  }
  if (event.hostId === user.id) {
    return { success: false, message: "You're already the host of this event." }
  }

  const [existingCollaborator] = await db
    .select({ id: eventCollaborators.id })
    .from(eventCollaborators)
    .where(and(eq(eventCollaborators.eventId, invite.eventId), eq(eventCollaborators.userId, user.id)))
    .limit(1)

  if (!existingCollaborator) {
    await db.insert(eventCollaborators).values({
      eventId: invite.eventId,
      userId: user.id,
      invitedBy: invite.createdBy,
    })
  }

  await db
    .update(collaboratorInvites)
    .set({ usedAt: new Date(), usedByUserId: user.id })
    .where(eq(collaboratorInvites.id, invite.id))

  return { success: true, message: "You're now a co-host.", data: { eventId: invite.eventId } }
}
