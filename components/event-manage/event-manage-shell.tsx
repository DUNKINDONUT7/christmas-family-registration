"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, PartyPopper, Users, CalendarClock, Settings2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShareLinkButton } from "@/components/share-link-button"
import { AttendeesPanel } from "./attendees-panel"
import { ItineraryPanel } from "./itinerary-panel"
import { SettingsPanel } from "./settings-panel"
import { EVENT_STATUS_META } from "@/lib/constants"
import { formatEventDate } from "@/lib/utils/format"
import type { Event, ScheduleItem } from "@/lib/db/schema"
import type { RegistrationWithMembers } from "@/lib/queries/registrations"

interface Collaborator {
  userId: string
  name: string
  email: string
}

export function EventManageShell({
  event,
  role,
  registrations,
  scheduleItems,
  collaborators,
  showWelcomeBanner,
}: {
  event: Event
  role: "owner" | "collaborator"
  registrations: RegistrationWithMembers[]
  scheduleItems: ScheduleItem[]
  collaborators: Collaborator[]
  showWelcomeBanner: boolean
}) {
  const [bannerDismissed, setBannerDismissed] = useState(false)
  // NEXT_PUBLIC_* vars are inlined at build time, so this is identical on
  // server and client — using window.location.origin here would risk a
  // hydration mismatch if it ever differed from the configured app URL.
  const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/e/${event.slug}`
  const pendingCount = registrations.filter((r) => r.status === "pending").length

  return (
    <div>
      {showWelcomeBanner && !bannerDismissed && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <PartyPopper className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Your event is ready.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              It's saved as a draft so only you can see it. Share your registration link below whenever you're
              ready to open it up — and don't forget to set it to "Open" in Settings.
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setBannerDismissed(true)} aria-label="Dismiss">
            <X className="size-4" />
          </Button>
        </div>
      )}

      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to your events
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline">{EVENT_STATUS_META[event.status].label}</Badge>
            {role === "collaborator" && <Badge variant="outline">Co-host</Badge>}
          </div>
          <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">{event.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatEventDate(event.eventDate)}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Link
            href={`/e/${event.slug}`}
            target="_blank"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            View public page <ExternalLink className="size-3.5" />
          </Link>
          <ShareLinkButton url={registrationUrl} label="Copy registration link" />
        </div>
      </div>

      <Tabs defaultValue="attendees">
        <TabsList>
          <TabsTrigger value="attendees">
            <Users className="size-4" />
            Guests
            {pendingCount > 0 && (
              <Badge className="ml-1 bg-accent text-accent-foreground">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="itinerary">
            <CalendarClock className="size-4" />
            Schedule
          </TabsTrigger>
          {role === "owner" && (
            <TabsTrigger value="settings">
              <Settings2 className="size-4" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="attendees" className="pt-6">
          <AttendeesPanel eventId={event.id} registrations={registrations} />
        </TabsContent>
        <TabsContent value="itinerary" className="pt-6">
          <ItineraryPanel eventId={event.id} scheduleItems={scheduleItems} />
        </TabsContent>
        {role === "owner" && (
          <TabsContent value="settings" className="pt-6">
            <SettingsPanel event={event} collaborators={collaborators} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
