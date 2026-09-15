"use server"

import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth/dal"
import { db } from "@/lib/db"
import { events } from "@/lib/db/schema"
import { generateEventSlug } from "@/lib/utils/slug"
import { deriveTicketPrefix } from "@/lib/utils/ticket"
import { createEventSchema } from "@/lib/validations/event"
import { zodErrorToFieldErrors, type ActionResult } from "@/lib/action-result"
import type { EventDetailsInput } from "@/lib/validations/event"

export async function createEventAction(input: EventDetailsInput): Promise<ActionResult> {
  const user = await requireUser()

  const parsed = createEventSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "Please fix the errors below.", fieldErrors: zodErrorToFieldErrors(parsed.error) }
  }

  const {
    title,
    description,
    eventDate,
    eventTime,
    venue,
    dressCode,
    cateringStyle,
    menuDetails,
    themeColor,
    capacity,
    coverImageUrl,
  } = parsed.data

  const [event] = await db
    .insert(events)
    .values({
      hostId: user.id,
      slug: generateEventSlug(title),
      title,
      description: description || null,
      eventDate,
      eventTime: eventTime || null,
      venue: venue || null,
      dressCode: dressCode || null,
      cateringStyle: cateringStyle || null,
      menuDetails: menuDetails || null,
      themeColor,
      ticketPrefix: deriveTicketPrefix(title),
      capacity: capacity ?? null,
      coverImageUrl: coverImageUrl || null,
      status: "draft",
    })
    .returning({ id: events.id })

  redirect(`/dashboard/events/${event.id}?welcome=1`)
}
