import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getEventBySlug } from "@/lib/queries/events"
import { getEventScheduleItems } from "@/lib/queries/registrations"
import { RegistrationPageClient } from "@/components/registration-page-client"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return { title: "Event not found" }
  return {
    title: event.title,
    description: event.description ?? `Register for ${event.title}.`,
  }
}

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const scheduleItems = await getEventScheduleItems(event.id)

  return <RegistrationPageClient event={event} scheduleItems={scheduleItems} />
}
