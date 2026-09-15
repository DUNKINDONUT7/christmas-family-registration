"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth/dal"
import { db } from "@/lib/db"
import { users, events } from "@/lib/db/schema"
import { zodErrorToFieldErrors, type ActionResult } from "@/lib/action-result"
import { z } from "zod"

async function requirePlatformAdmin() {
  const user = await requireUser()
  if (user.platformRole !== "admin") {
    throw new Error("Forbidden")
  }
  return user
}

const deleteUserSchema = z.object({ userId: z.string().uuid() })

export async function adminDeleteUserAction(input: z.infer<typeof deleteUserSchema>): Promise<ActionResult> {
  const admin = await requirePlatformAdmin()

  const parsed = deleteUserSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "Invalid request.", fieldErrors: zodErrorToFieldErrors(parsed.error) }
  }

  if (parsed.data.userId === admin.id) {
    return { success: false, message: "You can't delete your own account from here." }
  }

  await db.delete(users).where(eq(users.id, parsed.data.userId))

  revalidatePath("/admin")
  return { success: true, message: "Account deleted." }
}

const deleteEventSchema = z.object({ eventId: z.string().uuid() })

export async function adminDeleteEventAction(input: z.infer<typeof deleteEventSchema>): Promise<ActionResult> {
  await requirePlatformAdmin()

  const parsed = deleteEventSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "Invalid request." }
  }

  await db.delete(events).where(eq(events.id, parsed.data.eventId))

  revalidatePath("/admin")
  return { success: true, message: "Event deleted." }
}
