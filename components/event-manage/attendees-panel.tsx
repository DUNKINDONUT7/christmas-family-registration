"use client"

import { useMemo, useState, useTransition } from "react"
import { Check, Download, MoreHorizontal, Pencil, Search, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { RegistrationEditDialog } from "./registration-edit-dialog"
import { decideRegistrationAction, deleteRegistrationAction } from "@/app/dashboard/events/[eventId]/actions"
import type { RegistrationWithMembers } from "@/lib/queries/registrations"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-accent text-accent-foreground border-0",
  approved: "bg-primary/15 text-primary border-0",
  rejected: "bg-destructive/10 text-destructive border-0",
}

export function AttendeesPanel({ eventId, registrations }: { eventId: string; registrations: RegistrationWithMembers[] }) {
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()
  const [editingRegistration, setEditingRegistration] = useState<RegistrationWithMembers | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return registrations
    return registrations.filter(
      (r) =>
        r.registrantName.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.ticketCode.toLowerCase().includes(term) ||
        r.members.some((m) => m.toLowerCase().includes(term))
    )
  }, [search, registrations])

  function handleDecide(registrationId: string, status: "approved" | "rejected") {
    startTransition(async () => {
      const result = await decideRegistrationAction({ registrationId, status })
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  function handleDelete(registrationId: string) {
    startTransition(async () => {
      const result = await deleteRegistrationAction({ registrationId })
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  if (registrations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="font-display text-lg font-medium">No registrations yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your event's registration link and guests will show up here.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, or ticket…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={`/dashboard/events/${eventId}/export`}>
            <Download className="size-4" />
            Export CSV
          </a>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registrant</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Ticket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell className="font-medium">{registration.registrantName}</TableCell>
                <TableCell>
                  <div className="flex max-w-[220px] flex-wrap gap-1">
                    {registration.members.map((member, i) => (
                      <Badge key={i} variant="secondary" className="font-normal">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{registration.email}</TableCell>
                <TableCell className="font-mono text-xs">{registration.ticketCode}</TableCell>
                <TableCell>
                  <Badge className={STATUS_STYLES[registration.status]}>{registration.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {registration.status === "pending" && (
                      <>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => handleDecide(registration.id, "approved")}
                          aria-label="Approve"
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => handleDecide(registration.id, "rejected")}
                          aria-label="Reject"
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon-sm" variant="ghost" aria-label="More actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditingRegistration(registration)}>
                          <Pencil className="size-4" /> Edit
                        </DropdownMenuItem>
                        {registration.status !== "pending" && (
                          <DropdownMenuItem
                            onSelect={() =>
                              handleDecide(registration.id, registration.status === "approved" ? "rejected" : "approved")
                            }
                          >
                            {registration.status === "approved" ? "Mark as rejected" : "Mark as approved"}
                          </DropdownMenuItem>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="size-4" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this registration?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This removes {registration.registrantName} and their ticket permanently. This can't be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(registration.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No registrations match "{search}".</p>
      )}

      {editingRegistration && (
        <RegistrationEditDialog
          registration={editingRegistration}
          open={!!editingRegistration}
          onOpenChange={(open) => !open && setEditingRegistration(null)}
        />
      )}
    </div>
  )
}
