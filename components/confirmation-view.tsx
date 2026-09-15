"use client"

import Link from "next/link"
import { CalendarPlus, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TicketStub } from "@/components/ticket-stub"
import { getThemeGradient } from "@/lib/constants"
import { buildGoogleCalendarUrl } from "@/lib/utils/calendar"
import type { Event, ScheduleItem } from "@/lib/db/schema"
import type { RegistrationWithMembers } from "@/lib/queries/registrations"

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  pending: {
    title: "You're on the list — pending approval",
    body: "The host reviews every registration before it's confirmed. This page updates once they decide, so check back or watch your email.",
  },
  approved: {
    title: "You're confirmed! 🎉",
    body: "Save your ticket below — you can show it at the door or just have your name ready.",
  },
  rejected: {
    title: "This registration wasn't approved",
    body: "Reach out to the host directly if you think this is a mistake.",
  },
}

export function ConfirmationView({
  event,
  registration,
  scheduleItems,
}: {
  event: Event
  registration: RegistrationWithMembers
  scheduleItems: ScheduleItem[]
}) {
  const gradient = getThemeGradient(event.themeColor, event.customColorHex)
  const copy = STATUS_COPY[registration.status]
  const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/e/${event.slug}/confirmation/${registration.id}`
  const googleCalendarUrl = buildGoogleCalendarUrl({
    title: event.title,
    description: event.description,
    venue: event.venue,
    eventDate: event.eventDate,
    eventTime: event.eventTime,
  })

  return (
    <div className="min-h-screen" style={{ background: gradient }}>
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl print:shadow-none">
          <h1 className="font-display text-2xl font-medium">{copy.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{copy.body}</p>

          <div className="mt-8 flex justify-center">
            <TicketStub
              eventTitle={event.title}
              eventDate={event.eventDate}
              eventTime={event.eventTime}
              themeColor={event.themeColor}
              customColorHex={event.customColorHex}
              registrantName={registration.registrantName}
              memberCount={registration.members.length}
              ticketCode={registration.ticketCode}
              status={registration.status}
              qrValue={confirmationUrl}
            />
          </div>

          {registration.members.length > 0 && (
            <div className="mt-6 text-left">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Guests</p>
              <ul className="flex flex-wrap gap-2">
                {registration.members.map((member, i) => (
                  <li key={i} className="rounded-full bg-secondary px-3 py-1 text-sm">
                    {member}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scheduleItems.length > 0 && (
            <div className="mt-6 text-left">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Schedule</p>
              <ul className="space-y-1.5 text-sm">
                {scheduleItems.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{item.time}</span>
                    <span>{item.activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
            <Button asChild variant="outline" size="sm">
              <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                <CalendarPlus className="size-4" /> Add to Google Calendar
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={`/e/${event.slug}/confirmation/${registration.id}/calendar.ics`}>
                <CalendarPlus className="size-4" /> Apple / Outlook
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-4" /> Print
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground print:hidden">
            <Link href={`/e/${event.slug}/status`} className="hover:underline">
              Look up this ticket again later
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
