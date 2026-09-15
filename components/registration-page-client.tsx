"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { CalendarDays, MapPin, Plus, Shirt, UtensilsCrossed, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { TicketStub } from "@/components/ticket-stub"
import { getThemeGradient, CATERING_STYLE_META } from "@/lib/constants"
import { formatEventDate, formatEventTime } from "@/lib/utils/format"
import { registerForEventSchema, type RegisterForEventInput } from "@/lib/validations/registration"
import { registerForEventAction } from "@/app/e/[slug]/actions"
import type { Event, ScheduleItem } from "@/lib/db/schema"

export function RegistrationPageClient({ event, scheduleItems }: { event: Event; scheduleItems: ScheduleItem[] }) {
  const gradient = getThemeGradient(event.themeColor, event.customColorHex)

  if (event.status !== "open") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6" style={{ background: gradient }}>
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <h1 className="font-display text-2xl font-medium">{event.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {event.status === "draft"
              ? "Registration for this event hasn't opened yet. Check back soon."
              : "Registration for this event is now closed."}
          </p>
          <Link
            href={`/e/${event.slug}/status`}
            className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
          >
            Already registered? Check your status
          </Link>
        </div>
      </div>
    )
  }

  return <OpenRegistrationForm event={event} scheduleItems={scheduleItems} />
}

function OpenRegistrationForm({ event, scheduleItems }: { event: Event; scheduleItems: ScheduleItem[] }) {
  const gradient = getThemeGradient(event.themeColor, event.customColorHex)
  const [isPending, startTransition] = useTransition()

  const form = useForm<RegisterForEventInput>({
    resolver: zodResolver(registerForEventSchema),
    defaultValues: { slug: event.slug, registrantName: "", email: "", phone: "", members: [""] },
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "members" as never })
  const watchedName = form.watch("registrantName")
  const watchedMembers = form.watch("members")

  function onSubmit(values: RegisterForEventInput) {
    startTransition(async () => {
      const result = await registerForEventAction(values)
      if (!result.success) {
        toast.error(result.message)
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof RegisterForEventInput, { message })
          }
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border" style={{ background: gradient }}>
        <div className="mx-auto max-w-4xl px-6 py-14 text-white">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/70">You're invited</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl">{event.title}</h1>
          {event.description && <p className="mt-3 max-w-xl text-white/85">{event.description}</p>}

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatEventDate(event.eventDate)}
              {formatEventTime(event.eventTime) ? `, ${formatEventTime(event.eventTime)}` : ""}
            </span>
            {event.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {event.venue}
              </span>
            )}
            {event.dressCode && (
              <span className="flex items-center gap-1.5">
                <Shirt className="size-4" />
                {event.dressCode}
              </span>
            )}
            {event.cateringStyle && (
              <span className="flex items-center gap-1.5">
                <UtensilsCrossed className="size-4" />
                {CATERING_STYLE_META[event.cateringStyle].label}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-10 px-6 py-12 lg:grid-cols-[1fr_320px]">
        <div>
          {event.menuDetails && (
            <div className="mb-10 rounded-xl border border-border bg-card p-5">
              <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-medium">
                <UtensilsCrossed className="size-4" />
                What's on the menu
              </h2>
              <p className="text-sm text-muted-foreground">{event.menuDetails}</p>
            </div>
          )}

          {scheduleItems.length > 0 && (
            <div className="mb-10 rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 font-display text-lg font-medium">What to expect</h2>
              <ul className="space-y-2 text-sm">
                {scheduleItems.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{item.time}</span>
                    <span>{item.activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="mb-1 font-display text-xl font-medium">Register</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            The host reviews registrations before they're confirmed — you'll get a ticket once approved.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="registrantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your name (or family/group name)</FormLabel>
                    <FormControl>
                      <Input placeholder="Garcia Family" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Who's coming?</FormLabel>
                <div className="mt-2 space-y-2">
                  {fields.map((fieldItem, index) => (
                    <div key={fieldItem.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`members.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder={`Person ${index + 1}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                        aria-label="Remove person"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append("")}>
                  <Plus className="size-4" /> Add another person
                </Button>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                {isPending ? "Registering…" : "Register"}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link href={`/e/${event.slug}/status`} className="font-medium text-primary hover:underline">
              Check your status
            </Link>
          </p>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-10">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Your ticket preview
            </p>
            <TicketStub
              eventTitle={event.title}
              eventDate={event.eventDate}
              eventTime={event.eventTime}
              themeColor={event.themeColor}
              customColorHex={event.customColorHex}
              registrantName={watchedName}
              memberCount={watchedMembers?.filter(Boolean).length || 1}
              status="pending"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
