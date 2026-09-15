import Link from "next/link"
import { Users, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { THEME_COLOR_META } from "@/lib/constants"
import { EVENT_STATUS_META } from "@/lib/constants"
import { formatEventDate } from "@/lib/utils/format"
import type { EventWithCounts } from "@/lib/queries/events"

const STATUS_BADGE_VARIANT: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  open: "bg-primary/15 text-primary",
  closed: "bg-destructive/10 text-destructive",
}

export function EventCard({ event, role }: { event: EventWithCounts; role: "owner" | "collaborator" }) {
  const theme = THEME_COLOR_META[event.themeColor]

  return (
    <Link
      href={`/dashboard/events/${event.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="relative flex min-h-[110px] flex-col justify-between p-5 text-white"
        style={{ background: theme.gradient }}
      >
        <div className="flex items-start justify-between gap-2">
          <Badge className={`${STATUS_BADGE_VARIANT[event.status]} border-0`}>{EVENT_STATUS_META[event.status].label}</Badge>
          {role === "collaborator" && (
            <Badge variant="outline" className="border-white/40 bg-white/10 text-white">
              Co-host
            </Badge>
          )}
        </div>
        <div>
          <h3 className="font-display text-lg font-medium leading-snug drop-shadow-sm">{event.title}</h3>
          <p className="mt-1 text-sm text-white/85">{formatEventDate(event.eventDate)}</p>
        </div>
      </div>

      <div className="ticket-perforation" />

      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            {event.approvedCount} confirmed
          </span>
          {event.pendingCount > 0 && (
            <span className="flex items-center gap-1.5 text-accent-foreground">
              <Clock className="size-4" />
              {event.pendingCount} pending
            </span>
          )}
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground group-hover:text-primary">
          Manage →
        </span>
      </div>
    </Link>
  )
}
