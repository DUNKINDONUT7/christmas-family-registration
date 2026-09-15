"use server"

import { and, eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import {
  events,
  scheduleItems,
  registrations,
  registrationMembers,
  eventCollaborators,
  collaboratorInvites,
  users,
} from "@/lib/db/schema"
import { authorizeEventAction } from "@/lib/auth/event-access"
import { isUniqueConstraintViolation } from "@/lib/db/errors"
import { generateRawToken, hashToken } from "@/lib/utils/token"
import { sendRegistrationStatusChangedEmail, sendCollaboratorInviteEmail } from "@/lib/email"
import {
  eventDetailsSchema,
  updateEventStatusSchema,
  itineraryFormSchema,
  type EventDetailsInput,
  type ItineraryFormInput,
} from "@/lib/validations/event"
import {
  updateRegistrationSchema,
  decideRegistrationSchema,
  deleteRegistrationSchema,
} from "@/lib/validations/registration"
import { zodErrorToFieldErrors, type ActionResult } from "@/lib/action-result"
import { z } from "zod"

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function eventPath(eventId: string) {
  return `/dashboard/events/${eventId}`
}

// ---------------- Event details / settings ----------------

export async function updateEventDetailsAction(eventId: string, input: EventDetailsInput): Promise<ActionResult> {
  const auth = await authorizeEventAction(eventId, "owner")
  if (!auth.ok) return auth.result

  const parsed = eventDetailsSchema.safeParse(input)
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

  await db
    .update(events)
    .set({
      title,
      description: description || null,
      eventDate,
      eventTime: eventTime || null,
      venue: venue || null,
      dressCode: dressCode || null,
      cateringStyle: cateringStyle || null,
      menuDetails: menuDetails || null,
      themeColor,
      capacity: capacity ?? null,
      coverImageUrl: coverImageUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId))

  revalidatePath(eventPath(eventId))
  return { success: true, message: "Event details saved." }
}

export async function updateEventStatusAction(input: z.infer<typeof updateEventStatusSchema>): Promise<ActionResult> {
  const parsed = updateEventStatusSchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Invalid status." }

  const auth = await authorizeEventAction(parsed.data.eventId, "owner")
  if (!auth.ok) return auth.result

  await db.update(events).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(events.id, parsed.data.eventId))

  revalidatePath(eventPath(parsed.data.eventId))
  return { success: true, message: "Status updated." }
}

export async function deleteEventAction(eventId: string): Promise<ActionResult> {
  const auth = await authorizeEventAction(eventId, "owner")
  if (!auth.ok) return auth.result

  await db.delete(events).where(eq(events.id, eventId))
  return { success: true, message: "Event deleted." }
}

// ---------------- Itinerary / schedule ----------------

export async function saveItineraryAction(input: ItineraryFormInput): Promise<ActionResult> {
  const parsed = itineraryFormSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "Please fix the errors below.", fieldErrors: zodErrorToFieldErrors(parsed.error) }
  }

  const auth = await authorizeEventAction(parsed.data.eventId, "any")
  if (!auth.ok) return auth.result

  await db.delete(scheduleItems).where(eq(scheduleItems.eventId, parsed.data.eventId))
  if (parsed.data.scheduleItems.length > 0) {
    await db.insert(scheduleItems).values(
      parsed.data.scheduleItems.map((item, index) => ({
        eventId: parsed.data.eventId,
        time: item.time,
        activity: item.activity,
        sortOrder: index,
      }))
    )
  }

  revalidatePath(eventPath(parsed.data.eventId))
  return { success: true, message: "Schedule saved." }
}

// ---------------- Registrations ----------------

export async function decideRegistrationAction(input: z.infer<typeof decideRegistrationSchema>): Promise<ActionResult> {
  const parsed = decideRegistrationSchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Invalid request." }

  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, parsed.data.registrationId))
    .limit(1)
  if (!registration) return { success: false, message: "Registration not found." }

  const auth = await authorizeEventAction(registration.eventId, "any")
  if (!auth.ok) return auth.result

  await db
    .update(registrations)
    .set({
      status: parsed.data.status,
      adminNote: parsed.data.adminNote || null,
      decidedAt: new Date(),
      decidedBy: auth.userId,
    })
    .where(eq(registrations.id, registration.id))

  if (parsed.data.status === "approved" || parsed.data.status === "rejected") {
    const [event] = await db.select({ title: events.title, slug: events.slug }).from(events).where(eq(events.id, registration.eventId)).limit(1)
    if (event) {
      await sendRegistrationStatusChangedEmail({
        to: registration.email,
        registrantName: registration.registrantName,
        eventTitle: event.title,
        status: parsed.data.status,
        confirmationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/e/${event.slug}/confirmation/${registration.id}`,
      })
    }
  }

  revalidatePath(eventPath(registration.eventId))
  return { success: true, message: `Registration ${parsed.data.status}.` }
}

export async function updateRegistrationAction(input: z.infer<typeof updateRegistrationSchema>): Promise<ActionResult> {
  const parsed = updateRegistrationSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "Please fix the errors below.", fieldErrors: zodErrorToFieldErrors(parsed.error) }
  }

  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, parsed.data.registrationId))
    .limit(1)
  if (!registration) return { success: false, message: "Registration not found." }

  const auth = await authorizeEventAction(registration.eventId, "any")
  if (!auth.ok) return auth.result

  try {
    await db
      .update(registrations)
      .set({
        registrantName: parsed.data.registrantName,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone || null,
      })
      .where(eq(registrations.id, registration.id))
  } catch (error) {
    if (isUniqueConstraintViolation(error, "registrations_event_email_idx")) {
      return {
        success: false,
        message: "That email is already used by another registration for this event.",
        fieldErrors: { email: "Already registered for this event." },
      }
    }
    throw error
  }

  await db.delete(registrationMembers).where(eq(registrationMembers.registrationId, registration.id))
  await db.insert(registrationMembers).values(
    parsed.data.members.map((name, index) => ({
      registrationId: registration.id,
      name,
      sortOrder: index,
    }))
  )

  revalidatePath(eventPath(registration.eventId))
  return { success: true, message: "Registration updated." }
}

export async function deleteRegistrationAction(input: z.infer<typeof deleteRegistrationSchema>): Promise<ActionResult> {
  const parsed = deleteRegistrationSchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Invalid request." }

  const [registration] = await db
    .select({ eventId: registrations.eventId })
    .from(registrations)
    .where(eq(registrations.id, parsed.data.registrationId))
    .limit(1)
  if (!registration) return { success: false, message: "Registration not found." }

  const auth = await authorizeEventAction(registration.eventId, "any")
  if (!auth.ok) return auth.result

  await db.delete(registrations).where(eq(registrations.id, parsed.data.registrationId))

  revalidatePath(eventPath(registration.eventId))
  return { success: true, message: "Registration deleted." }
}

// ---------------- Collaborators ----------------

const generateInviteSchema = z.object({
  eventId: z.string().uuid(),
  email: z.string().trim().email().optional().or(z.literal("")),
})

export async function generateCollaboratorInviteAction(
  input: z.infer<typeof generateInviteSchema>
): Promise<ActionResult<{ inviteUrl: string }>> {
  const parsed = generateInviteSchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Invalid request." }

  const auth = await authorizeEventAction(parsed.data.eventId, "owner")
  if (!auth.ok) return auth.result

  // Only one active invite link per event at a time — creating a new
  // one invalidates any prior unused invite.
  await db
    .update(collaboratorInvites)
    .set({ expiresAt: new Date() })
    .where(and(eq(collaboratorInvites.eventId, parsed.data.eventId), isNull(collaboratorInvites.usedAt)))

  const rawToken = generateRawToken()
  await db.insert(collaboratorInvites).values({
    eventId: parsed.data.eventId,
    tokenHash: hashToken(rawToken),
    createdBy: auth.userId,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  })

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${rawToken}`

  if (parsed.data.email) {
    const [event] = await db.select({ title: events.title }).from(events).where(eq(events.id, parsed.data.eventId)).limit(1)
    const [inviter] = await db.select({ name: users.name }).from(users).where(eq(users.id, auth.userId)).limit(1)
    if (event && inviter) {
      await sendCollaboratorInviteEmail({
        to: parsed.data.email,
        eventTitle: event.title,
        inviterName: inviter.name,
        inviteUrl,
      })
    }
  }

  revalidatePath(eventPath(parsed.data.eventId))
  return { success: true, message: "Invite link created.", data: { inviteUrl } }
}

const removeCollaboratorSchema = z.object({
  eventId: z.string().uuid(),
  collaboratorUserId: z.string().uuid(),
})

export async function removeCollaboratorAction(input: z.infer<typeof removeCollaboratorSchema>): Promise<ActionResult> {
  const parsed = removeCollaboratorSchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Invalid request." }

  const auth = await authorizeEventAction(parsed.data.eventId, "owner")
  if (!auth.ok) return auth.result

  await db
    .delete(eventCollaborators)
    .where(
      and(
        eq(eventCollaborators.eventId, parsed.data.eventId),
        eq(eventCollaborators.userId, parsed.data.collaboratorUserId)
      )
    )

  revalidatePath(eventPath(parsed.data.eventId))
  return { success: true, message: "Co-host removed." }
}
