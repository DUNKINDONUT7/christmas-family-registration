"use client"

import { useTransition } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeColorPicker } from "@/components/theme-color-picker"
import { EventPreviewCard } from "@/components/event-preview-card"
import { eventDetailsSchema, type EventDetailsInput } from "@/lib/validations/event"
import { DEFAULT_CUSTOM_COLOR_HEX, CATERING_STYLES, CATERING_STYLE_META } from "@/lib/constants"
import { createEventAction } from "../actions"

export default function NewEventPage() {
  const [isPending, startTransition] = useTransition()
  const form = useForm<EventDetailsInput>({
    resolver: zodResolver(eventDetailsSchema),
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      venue: "",
      dressCode: "",
      cateringStyle: "",
      menuDetails: "",
      themeColor: "christmas-red",
      customColorHex: DEFAULT_CUSTOM_COLOR_HEX,
      capacity: undefined,
      coverImageUrl: "",
    },
  })

  const watchedTitle = form.watch("title")
  const watchedDescription = form.watch("description")
  const watchedEventDate = form.watch("eventDate")
  const watchedEventTime = form.watch("eventTime")
  const watchedVenue = form.watch("venue")
  const watchedDressCode = form.watch("dressCode")
  const watchedCateringStyle = form.watch("cateringStyle")
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
        Fill in everything now, or come back and edit any of it later from Settings.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="A few words guests will see on the registration page." {...field} />
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
              name="dressCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dress code (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Festive attire" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cateringStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food & catering (optional)</FormLabel>
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Not specified" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATERING_STYLES.map((style) => (
                        <SelectItem key={style} value={style}>
                          {CATERING_STYLE_META[style].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Lets guests know what to expect before they RSVP.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="menuDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What's on the menu (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Lechon, pancit canton, leche flan, unlimited iced tea" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest capacity (optional)</FormLabel>
                  <FormDescription>Just a number to help you plan — registration isn't blocked automatically yet.</FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="No limit"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://…" {...field} />
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
              description={watchedDescription}
              eventDate={watchedEventDate}
              eventTime={watchedEventTime}
              venue={watchedVenue}
              dressCode={watchedDressCode}
              cateringStyle={watchedCateringStyle}
              themeColor={watchedThemeColor}
              customColorHex={watchedCustomColorHex}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
