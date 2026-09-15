import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth/dal"
import { getEventRole } from "@/lib/auth/event-access"
import { getEventById } from "@/lib/queries/events"
import { getEventRegistrations, getEventScheduleItems, getEventCollaborators } from "@/lib/queries/registrations"
import { EventManageShell } from "@/components/event-manage/event-manage-shell"

export default async function EventManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ welcome?: string }>
}) {
  const { eventId } = await params
  const { welcome } = await searchParams
  const user = await requireUser()

  const event = await getEventById(eventId)
  if (!event) notFound()

  const role = await getEventRole(eventId, user.id, user.platformRole === "admin")
  if (!role) notFound()

  const [registrations, scheduleItems, collaborators] = await Promise.all([
    getEventRegistrations(eventId),
    getEventScheduleItems(eventId),
    role === "owner" ? getEventCollaborators(eventId) : Promise.resolve([]),
  ])

  return (
    <EventManageShell
      event={event}
      role={role}
      registrations={registrations}
      scheduleItems={scheduleItems}
      collaborators={collaborators}
      showWelcomeBanner={welcome === "1"}
    />
  )
}
