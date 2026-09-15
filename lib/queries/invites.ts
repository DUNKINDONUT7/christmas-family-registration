import "server-only"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { collaboratorInvites, events, users } from "@/lib/db/schema"
import { hashToken } from "@/lib/utils/token"

export type InviteLookupResult =
  | { valid: true; eventId: string; eventTitle: string; inviterName: string }
  | { valid: false; reason: "not_found" | "expired" | "used" }

/** Read-only validity check + display info — does not consume the invite. */
export async function lookupInviteByRawToken(rawToken: string): Promise<InviteLookupResult> {
  const tokenHash = hashToken(rawToken)

  const [invite] = await db
    .select({
      id: collaboratorInvites.id,
      eventId: collaboratorInvites.eventId,
      expiresAt: collaboratorInvites.expiresAt,
      usedAt: collaboratorInvites.usedAt,
      createdBy: collaboratorInvites.createdBy,
    })
    .from(collaboratorInvites)
    .where(eq(collaboratorInvites.tokenHash, tokenHash))
    .limit(1)

  if (!invite) return { valid: false, reason: "not_found" }
  if (invite.usedAt) return { valid: false, reason: "used" }
  if (invite.expiresAt < new Date()) return { valid: false, reason: "expired" }

  const [event] = await db.select({ title: events.title }).from(events).where(eq(events.id, invite.eventId)).limit(1)
  const [inviter] = await db.select({ name: users.name }).from(users).where(eq(users.id, invite.createdBy)).limit(1)

  if (!event || !inviter) return { valid: false, reason: "not_found" }

  return { valid: true, eventId: invite.eventId, eventTitle: event.title, inviterName: inviter.name }
}
