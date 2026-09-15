import { getEventBySlug } from "@/lib/queries/events"
import { getRegistrationById } from "@/lib/queries/registrations"
import { buildIcsContent } from "@/lib/utils/calendar"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; registrationId: string }> }
) {
  const { slug, registrationId } = await params

  const event = await getEventBySlug(slug)
  if (!event) return new Response("Not found", { status: 404 })

  const registration = await getRegistrationById(registrationId)
  if (!registration || registration.eventId !== event.id) {
    return new Response("Not found", { status: 404 })
  }

  const ics = buildIcsContent(
    {
      title: event.title,
      description: event.description,
      venue: event.venue,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
    },
    `registration-${registration.id}@admit-one`
  )

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics"`,
    },
  })
}
