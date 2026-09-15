import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  date,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const eventStatusEnum = pgEnum("event_status", ["draft", "open", "closed"])
export const registrationStatusEnum = pgEnum("registration_status", [
  "pending",
  "approved",
  "rejected",
])
export const cateringStyleEnum = pgEnum("catering_style", [
  "buffet",
  "plated",
  "potluck",
  "snacks_only",
  "none",
])
export const themeColorEnum = pgEnum("theme_color", [
  "christmas-red",
  "pine-green",
  "metallic-gold",
  "snow-white",
  "midnight-blue",
  "rose-gold",
])

// Everyone who signs up is a host: they own events and can be invited
// as a collaborator on events owned by other hosts.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
}))

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostId: uuid("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: date("event_date", { mode: "string" }).notNull(),
  eventTime: text("event_time"),
  venue: text("venue"),
  dressCode: text("dress_code"),
  cateringStyle: cateringStyleEnum("catering_style"),
  menuDetails: text("menu_details"),
  themeColor: themeColorEnum("theme_color").notNull().default("christmas-red"),
  ticketPrefix: text("ticket_prefix").notNull(),
  status: eventStatusEnum("status").notNull().default("draft"),
  capacity: integer("capacity"),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex("events_slug_idx").on(table.slug),
}))

export const scheduleItems = pgTable("schedule_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  time: text("time").notNull(),
  activity: text("activity").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
})

export const registrations = pgTable("registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  registrantName: text("registrant_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: registrationStatusEnum("status").notNull().default("pending"),
  ticketCode: text("ticket_code").notNull(),
  adminNote: text("admin_note"),
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  decidedBy: uuid("decided_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => ({
  eventEmailIdx: uniqueIndex("registrations_event_email_idx").on(table.eventId, table.email),
  eventTicketIdx: uniqueIndex("registrations_event_ticket_idx").on(table.eventId, table.ticketCode),
}))

export const registrationMembers = pgTable("registration_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
})

// Accepted co-admins for an event. There is exactly one non-owner
// permission tier ("manager"): can manage guests + schedule, cannot
// delete the event, change settings, or invite further collaborators.
export const eventCollaborators = pgTable("event_collaborators", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  invitedBy: uuid("invited_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  eventUserIdx: uniqueIndex("event_collaborators_event_user_idx").on(table.eventId, table.userId),
}))

// Single-use, expiring invite links. Only the event owner may create
// one; creating a new invite for an event invalidates any prior unused
// invite for that same event (only one active link at a time).
export const collaboratorInvites = pgTable("collaborator_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  usedByUserId: uuid("used_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tokenHashIdx: uniqueIndex("collaborator_invites_token_hash_idx").on(table.tokenHash),
}))

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tokenHashIdx: uniqueIndex("password_reset_tokens_token_hash_idx").on(table.tokenHash),
}))

// ---- relations (used for db.query.* convenience reads) ----

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  collaborations: many(eventCollaborators),
}))

export const eventsRelations = relations(events, ({ one, many }) => ({
  host: one(users, { fields: [events.hostId], references: [users.id] }),
  scheduleItems: many(scheduleItems),
  registrations: many(registrations),
  collaborators: many(eventCollaborators),
  invites: many(collaboratorInvites),
}))

export const scheduleItemsRelations = relations(scheduleItems, ({ one }) => ({
  event: one(events, { fields: [scheduleItems.eventId], references: [events.id] }),
}))

export const registrationsRelations = relations(registrations, ({ one, many }) => ({
  event: one(events, { fields: [registrations.eventId], references: [events.id] }),
  members: many(registrationMembers),
}))

export const registrationMembersRelations = relations(registrationMembers, ({ one }) => ({
  registration: one(registrations, { fields: [registrationMembers.registrationId], references: [registrations.id] }),
}))

export const eventCollaboratorsRelations = relations(eventCollaborators, ({ one }) => ({
  event: one(events, { fields: [eventCollaborators.eventId], references: [events.id] }),
  user: one(users, { fields: [eventCollaborators.userId], references: [users.id] }),
}))

export const collaboratorInvitesRelations = relations(collaboratorInvites, ({ one }) => ({
  event: one(events, { fields: [collaboratorInvites.eventId], references: [events.id] }),
}))

export type User = typeof users.$inferSelect
export type Event = typeof events.$inferSelect
export type ScheduleItem = typeof scheduleItems.$inferSelect
export type Registration = typeof registrations.$inferSelect
export type RegistrationMember = typeof registrationMembers.$inferSelect
export type EventCollaborator = typeof eventCollaborators.$inferSelect
export type CollaboratorInvite = typeof collaboratorInvites.$inferSelect
