"use client"

import { useState, useTransition } from "react"
import { UserPlus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ShareLinkButton } from "@/components/share-link-button"
import { generateCollaboratorInviteAction, removeCollaboratorAction } from "@/app/dashboard/events/[eventId]/actions"

interface Collaborator {
  userId: string
  name: string
  email: string
}

export function CollaboratorsSection({ eventId, collaborators }: { eventId: string; collaborators: Collaborator[] }) {
  const [isPending, startTransition] = useTransition()
  const [inviteEmail, setInviteEmail] = useState("")
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null)

  function handleGenerateInvite() {
    startTransition(async () => {
      const result = await generateCollaboratorInviteAction({ eventId, email: inviteEmail })
      if (result.success && result.data) {
        setGeneratedInviteUrl(result.data.inviteUrl)
        toast.success(inviteEmail ? "Invite created and emailed." : "Invite link created.")
        setInviteEmail("")
      } else if (!result.success) {
        toast.error(result.message)
      }
    })
  }

  function handleRemove(collaboratorUserId: string) {
    startTransition(async () => {
      const result = await removeCollaboratorAction({ eventId, collaboratorUserId })
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-base font-medium">Co-hosts</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          People you've invited to help manage guests and the schedule. They can't delete this event, change
          settings, or invite anyone else — only you can do that.
        </p>
      </div>

      {collaborators.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {collaborators.map((c) => (
            <li key={c.userId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.email}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Remove ${c.name}`}>
                    <X className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {c.name} as co-host?</AlertDialogTitle>
                    <AlertDialogDescription>
                      They'll immediately lose access to manage this event. You can invite them again later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRemove(c.userId)}>Remove</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-dashed border-border p-4">
        <p className="mb-3 text-sm font-medium">Invite a co-host</p>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="email"
            placeholder="their-email@example.com (optional)"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="max-w-xs"
          />
          <Button type="button" onClick={handleGenerateInvite} disabled={isPending} size="sm">
            <UserPlus className="size-4" />
            Generate invite link
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          They'll need to create an account (or log in) before the link grants access. Creating a new link
          cancels any link you generated before.
        </p>

        {generatedInviteUrl && (
          <div className="mt-4 rounded-md bg-secondary/50 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Share this link — it works once:</p>
            <ShareLinkButton url={generatedInviteUrl} label="Copy invite link" />
          </div>
        )}
      </div>
    </div>
  )
}
