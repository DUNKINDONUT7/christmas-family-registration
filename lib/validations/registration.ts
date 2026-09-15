import { z } from "zod"
import { REGISTRATION_STATUSES } from "@/lib/constants"

// .trim().min(1) checks length, not truthiness — unlike the old PHP
// array_filter() approach, a member literally named "0" is valid here.
const memberNameSchema = z.string().trim().min(1, "Enter a name.").max(100)

export const registerForEventSchema = z.object({
  slug: z.string().min(1),
  registrantName: z.string().trim().min(2, "Enter a name (at least 2 characters).").max(150),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  members: z
    .array(memberNameSchema)
    .min(1, "Add at least one person.")
    .max(30, "That's a lot of people — please contact the host directly for groups over 30."),
})

export type RegisterForEventInput = z.infer<typeof registerForEventSchema>

export const registrationStatusLookupSchema = z.object({
  slug: z.string().min(1),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  ticketCode: z.string().trim().min(1, "Enter your ticket code."),
})

export const updateRegistrationSchema = z.object({
  registrationId: z.string().uuid(),
  registrantName: z.string().trim().min(2).max(150),
  email: z.string().trim().min(1).email(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  members: z.array(memberNameSchema).min(1).max(30),
})

export const decideRegistrationSchema = z.object({
  registrationId: z.string().uuid(),
  status: z.enum(REGISTRATION_STATUSES),
  adminNote: z.string().trim().max(1000).optional().or(z.literal("")),
})

export const deleteRegistrationSchema = z.object({
  registrationId: z.string().uuid(),
})
