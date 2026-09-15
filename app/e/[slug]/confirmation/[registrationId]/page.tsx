import { notFound } from "next/navigation"
import { getEventBySlug } from "@/lib/queries/events"
import { getRegistrationById, getEventScheduleItems } from "@/lib/queries/registrations"
import { ConfirmationView } from "@/components/confirmation-view"

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string; registrationId: string }>
}) {
  const { slug, registrationId } = await params

  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const registration = await getRegistrationById(registrationId)
  if (!registration || registration.eventId !== event.id) notFound()

  const scheduleItems = await getEventScheduleItems(event.id)

  return <ConfirmationView event={event} registration={registration} scheduleItems={scheduleItems} />
}
