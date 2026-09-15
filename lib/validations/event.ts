import { z } from "zod"
import { THEME_COLORS, EVENT_STATUSES, CATERING_STYLES } from "@/lib/constants"

export const scheduleItemSchema = z.object({
  time: z.string().trim().min(1, "Enter a time.").max(50),
  activity: z.string().trim().min(1, "Enter an activity.").max(200),
})

export type ScheduleItemInput = z.infer<typeof scheduleItemSchema>

export const eventDetailsSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(150),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  eventDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date."),
  eventTime: z.string().trim().max(20).optional().or(z.literal("")),
  venue: z.string().trim().max(200).optional().or(z.literal("")),
  dressCode: z.string().trim().max(200).optional().or(z.literal("")),
  cateringStyle: z.enum(CATERING_STYLES).optional().or(z.literal("")),
  menuDetails: z.string().trim().max(1000).optional().or(z.literal("")),
  themeColor: z.enum(THEME_COLORS),
  capacity: z.coerce.number().int().positive().max(100000).optional().nullable(),
  coverImageUrl: z
    .string()
    .trim()
    .url("Enter a valid image URL.")
    .max(2000)
    .optional()
    .or(z.literal("")),
})

export type EventDetailsInput = z.infer<typeof eventDetailsSchema>

export const createEventSchema = eventDetailsSchema

export const updateEventStatusSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(EVENT_STATUSES),
})

export const itineraryFormSchema = z.object({
  eventId: z.string().uuid(),
  scheduleItems: z.array(scheduleItemSchema).max(50),
})

export type ItineraryFormInput = z.infer<typeof itineraryFormSchema>
