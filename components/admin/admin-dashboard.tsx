"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Search, Trash2, Users, CalendarDays, Ticket, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { EVENT_STATUS_META } from "@/lib/constants"
import { formatEventDate, formatDateTime } from "@/lib/utils/format"
import { adminDeleteEventAction, adminDeleteUserAction } from "@/app/admin/actions"
import type { AdminEventRow, AdminUserRow } from "@/lib/queries/admin"

interface AdminDashboardProps {
  stats: { totalUsers: number; totalEvents: number; totalRegistrations: number }
  events: AdminEventRow[]
  users: AdminUserRow[]
  currentUserId: string
}

export function AdminDashboard({ stats, events, users, currentUserId }: AdminDashboardProps) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-medium tracking-tight">Platform overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every host and every event on this site.</p>
      </div>

      <div className="mb-10 grid grid-cols-3 gap-4">
        <StatCard icon={<Users className="size-5" />} label="Hosts" value={stats.totalUsers} />
        <StatCard icon={<CalendarDays className="size-5" />} label="Events" value={stats.totalEvents} />
        <StatCard icon={<Ticket className="size-5" />} label="Registrations" value={stats.totalRegistrations} />
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="users">Hosts ({users.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="events" className="pt-6">
          <EventsTable events={events} />
        </TabsContent>
        <TabsContent value="users" className="pt-6">
          <UsersTable users={users} currentUserId={currentUserId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="font-display text-3xl font-medium">{value}</p>
    </div>
  )
}

function EventsTable({ events }: { events: AdminEventRow[] }) {
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()

  const filtered = events.filter((e) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return e.title.toLowerCase().includes(term) || e.hostName.toLowerCase().includes(term) || e.hostEmail.toLowerCase().includes(term)
  })

  function handleDelete(eventId: string) {
    startTransition(async () => {
      const result = await adminDeleteEventAction({ eventId })
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  return (
    <div>
      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search title or host…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {event.hostName}
                  <br />
                  <span className="text-xs">{event.hostEmail}</span>
                </TableCell>
                <TableCell className="text-sm">{formatEventDate(event.eventDate)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{EVENT_STATUS_META[event.status].label}</Badge>
                </TableCell>
                <TableCell>{event.registrationCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild size="icon-sm" variant="ghost" aria-label="Manage event">
                      <Link href={`/dashboard/events/${event.id}`}>
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon-sm" variant="ghost" aria-label="Delete event">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{event.title}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently deletes the event, its schedule, and all registrations. This can't be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction disabled={isPending} onClick={() => handleDelete(event.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No events match "{search}".</p>}
    </div>
  )
}

function UsersTable({ users, currentUserId }: { users: AdminUserRow[]; currentUserId: string }) {
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()

  const filtered = users.filter((u) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
  })

  function handleDelete(userId: string) {
    startTransition(async () => {
      const result = await adminDeleteUserAction({ userId })
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  return (
    <div>
      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name}
                  {user.id === currentUserId && (
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      You
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge className={user.platformRole === "admin" ? "bg-primary/15 text-primary border-0" : ""} variant={user.platformRole === "admin" ? undefined : "outline"}>
                    {user.platformRole}
                  </Badge>
                </TableCell>
                <TableCell>{user.eventCount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDateTime(new Date(user.createdAt))}</TableCell>
                <TableCell className="text-right">
                  {user.id !== currentUserId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon-sm" variant="ghost" aria-label="Delete account">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {user.name}'s account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently deletes their account and every event they host ({user.eventCount}{" "}
                            event{user.eventCount === 1 ? "" : "s"}), including all registrations. This can't be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction disabled={isPending} onClick={() => handleDelete(user.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No hosts match "{search}".</p>}
    </div>
  )
}
