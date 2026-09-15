"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { acceptInviteAction } from "@/app/invite/[token]/actions"

export function InviteAcceptCard({
  token,
  eventTitle,
  inviterName,
  isLoggedIn,
}: {
  token: string
  eventTitle: string
  inviterName: string
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const nextPath = `/invite/${token}`

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptInviteAction(token)
      if (result.success && result.data) {
        toast.success(result.message)
        router.push(`/dashboard/events/${result.data.eventId}`)
      } else if (!result.success) {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="font-display text-xl font-medium">You've been invited</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <strong>{inviterName}</strong> invited you to help manage <strong>{eventTitle}</strong> — you'll be able
          to approve guests and edit the schedule.
        </p>

        {isLoggedIn ? (
          <Button className="mt-6 w-full" onClick={handleAccept} disabled={isPending}>
            {isPending ? "Accepting…" : "Accept and go to event"}
          </Button>
        ) : (
          <div className="mt-6 space-y-2">
            <Button asChild className="w-full">
              <Link href={`/signup?next=${encodeURIComponent(nextPath)}`}>Create an account to accept</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>I already have an account</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
