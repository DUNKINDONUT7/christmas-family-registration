"use client"

import { useTransition } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { ThemeColorPicker } from "@/components/theme-color-picker"
import { EventPreviewCard } from "@/components/event-preview-card"
import { eventDetailsSchema, type EventDetailsInput } from "@/lib/validations/event"
import { DEFAULT_CUSTOM_COLOR_HEX } from "@/lib/constants"
import { createEventAction } from "../actions"

export default function NewEventPage() {
  const [isPending, startTransition] = useTransition()
  const form = useForm<EventDetailsInput>({
    resolver: zodResolver(eventDetailsSchema),
    defaultValues: {
      title: "",
      eventDate: "",
      eventTime: "",
      venue: "",
      themeColor: "christmas-red",
      customColorHex: DEFAULT_CUSTOM_COLOR_HEX,
    },
  })

  const watchedTitle = form.watch("title")
  const watchedEventDate = form.watch("eventDate")
  const watchedEventTime = form.watch("eventTime")
  const watchedVenue = form.watch("venue")
  const watchedThemeColor = form.watch("themeColor")
  const watchedCustomColorHex = form.watch("customColorHex")

  function onSubmit(values: EventDetailsInput) {
    startTransition(async () => {
      const result = await createEventAction(values)
      if (!result.success) {
        toast.error(result.message)
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof EventDetailsInput, { message })
          }
        }
      }
    })
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to your events
      </Link>

      <h1 className="font-display text-2xl font-medium tracking-tight">Create an event</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Just the basics for now — you can add a description, dress code, food, and full schedule right after.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event title</FormLabel>
                  <FormControl>
                    <Input placeholder="Garcia Family Christmas Party" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Community Center — Main Hall" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="themeColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color theme</FormLabel>
                  <FormDescription>Shown on your registration page and guests' tickets — see the live preview.</FormDescription>
                  <FormControl>
                    <ThemeColorPicker
                      value={field.value}
                      customColorHex={form.watch("customColorHex") || ""}
                      onChange={field.onChange}
                      onCustomColorChange={(hex) => form.setValue("customColorHex", hex, { shouldValidate: true })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              {isPending ? "Creating…" : "Create event"}
            </Button>
          </form>
        </Form>

        <div className="hidden lg:block">
          <div className="sticky top-10">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">Live preview</p>
            <EventPreviewCard
              title={watchedTitle}
              eventDate={watchedEventDate}
              eventTime={watchedEventTime}
              venue={watchedVenue}
              themeColor={watchedThemeColor}
              customColorHex={watchedCustomColorHex}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
