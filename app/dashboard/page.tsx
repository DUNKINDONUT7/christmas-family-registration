import Link from "next/link"
import { PlusCircle, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/event-card"
import { requireUser } from "@/lib/auth/dal"
import { getHostDashboardData } from "@/lib/queries/events"

export default async function DashboardPage() {
  const user = await requireUser()
  const { ownedEvents, collaboratingEvents } = await getHostDashboardData(user.id)

  const hasAnyEvents = ownedEvents.length > 0 || collaboratingEvents.length > 0

  if (!hasAnyEvents) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-accent">
          <Ticket className="size-7 text-accent-foreground" />
        </div>
        <h1 className="font-display text-2xl font-medium tracking-tight">Let's create your first event</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Give it a title and a date, and you'll get a shareable link right away. You can add the full
          schedule, guest approval, and everything else afterward.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/dashboard/new">
            <PlusCircle className="size-4" />
            Create your event
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight">Your events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Everything you're hosting, in one place.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new">
            <PlusCircle className="size-4" />
            New event
          </Link>
        </Button>
      </div>

      {ownedEvents.length > 0 && (
        <section>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ownedEvents.map((event) => (
              <EventCard key={event.id} event={event} role="owner" />
            ))}
          </div>
        </section>
      )}

      {collaboratingEvents.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-medium tracking-tight">You're helping host</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {collaboratingEvents.map((event) => (
              <EventCard key={event.id} event={event} role="collaborator" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
