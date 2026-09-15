"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ThemeColorPicker } from "@/components/theme-color-picker"
import { CollaboratorsSection } from "./collaborators-section"
import { eventDetailsSchema, type EventDetailsInput } from "@/lib/validations/event"
import { EVENT_STATUSES, EVENT_STATUS_META } from "@/lib/constants"
import { updateEventDetailsAction, updateEventStatusAction, deleteEventAction } from "@/app/dashboard/events/[eventId]/actions"
import type { Event } from "@/lib/db/schema"

interface Collaborator {
  userId: string
  name: string
  email: string
}

export function SettingsPanel({ event, collaborators }: { event: Event; collaborators: Collaborator[] }) {
  const [isSavingDetails, startSavingDetails] = useTransition()
  const [isSavingStatus, startSavingStatus] = useTransition()
  const [isDeleting, startDeleting] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteEventAction(event.id)
      if (result.success) {
        toast.success(result.message)
        router.push("/dashboard")
      } else {
        toast.error(result.message)
      }
    })
  }

  const form = useForm<EventDetailsInput>({
    resolver: zodResolver(eventDetailsSchema),
    defaultValues: {
      title: event.title,
      description: event.description ?? "",
      eventDate: event.eventDate,
      eventTime: event.eventTime ?? "",
      venue: event.venue ?? "",
      dressCode: event.dressCode ?? "",
      themeColor: event.themeColor,
      capacity: event.capacity ?? undefined,
      coverImageUrl: event.coverImageUrl ?? "",
    },
  })

  function onSubmitDetails(values: EventDetailsInput) {
    startSavingDetails(async () => {
      const result = await updateEventDetailsAction(event.id, values)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof EventDetailsInput, { message })
          }
        }
      }
    })
  }

  function handleStatusChange(status: string) {
    startSavingStatus(async () => {
      const result = await updateEventStatusAction({ eventId: event.id, status: status as (typeof EVENT_STATUSES)[number] })
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="max-w-2xl space-y-10">
      <section>
        <h3 className="font-display text-base font-medium">Registration status</h3>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">{EVENT_STATUS_META[event.status].description}</p>
        <Select value={event.status} onValueChange={handleStatusChange} disabled={isSavingStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {EVENT_STATUS_META[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <Separator />

      <section>
        <h3 className="mb-4 font-display text-base font-medium">Event details</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitDetails)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
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
                  <FormControl>
                    <ThemeColorPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSavingDetails}>
              {isSavingDetails ? "Saving…" : "Save details"}
            </Button>
          </form>
        </Form>
      </section>

      <Separator />

      <section>
        <CollaboratorsSection eventId={event.id} collaborators={collaborators} />
      </section>

      <Separator />

      <section>
        <h3 className="font-display text-base font-medium text-destructive">Danger zone</h3>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">
          Deleting this event permanently removes it, its schedule, and every registration. This can't be undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete event</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{event.title}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes the event, its schedule, and all {""}
                registrations and tickets. This can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? "Deleting…" : "Delete permanently"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  )
}
