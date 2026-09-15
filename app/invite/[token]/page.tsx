import { getCurrentUser } from "@/lib/auth/dal"
import { lookupInviteByRawToken } from "@/lib/queries/invites"
import { InviteAcceptCard } from "@/components/invite-accept-card"

const INVALID_REASON_COPY: Record<string, string> = {
  not_found: "This invite link doesn't exist. Double-check the link the host sent you.",
  expired: "This invite link has expired. Ask the host to generate a new one.",
  used: "This invite link has already been used. Ask the host to generate a new one if you still need access.",
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const [user, invite] = await Promise.all([getCurrentUser(), lookupInviteByRawToken(token)])

  if (!invite.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-6 py-12">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="font-display text-xl font-medium">Invite not available</h1>
          <p className="mt-3 text-sm text-muted-foreground">{INVALID_REASON_COPY[invite.reason]}</p>
        </div>
      </div>
    )
  }

  return (
    <InviteAcceptCard
      token={token}
      eventTitle={invite.eventTitle}
      inviterName={invite.inviterName}
      isLoggedIn={!!user}
    />
  )
}
