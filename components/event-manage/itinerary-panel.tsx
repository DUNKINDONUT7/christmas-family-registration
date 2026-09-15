"use client"

import { useTransition } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { itineraryFormSchema, type ItineraryFormInput } from "@/lib/validations/event"
import { saveItineraryAction } from "@/app/dashboard/events/[eventId]/actions"
import type { ScheduleItem } from "@/lib/db/schema"

export function ItineraryPanel({ eventId, scheduleItems }: { eventId: string; scheduleItems: ScheduleItem[] }) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<ItineraryFormInput>({
    resolver: zodResolver(itineraryFormSchema),
    defaultValues: {
      eventId,
      scheduleItems: scheduleItems.length
        ? scheduleItems.map((item) => ({ time: item.time, activity: item.activity }))
        : [{ time: "", activity: "" }],
    },
  })
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: "scheduleItems" })

  function onSubmit(values: ItineraryFormInput) {
    startTransition(async () => {
      const result = await saveItineraryAction(values)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="max-w-2xl">
      <p className="mb-6 text-sm text-muted-foreground">
        The run-of-show your guests see on their ticket and confirmation page. Add each item in order.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {fields.map((fieldItem, index) => (
            <div key={fieldItem.id} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3">
              <div className="flex flex-col gap-1 pt-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label="Move up"
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`scheduleItems.${index}.time`}
                render={({ field }) => (
                  <FormItem className="w-32 shrink-0">
                    <FormControl>
                      <Input placeholder="6:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`scheduleItems.${index}.activity`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Arrival & welcome reception" {...field} />
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
                aria-label="Remove item"
                className="mt-1"
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => append({ time: "", activity: "" })}>
              <Plus className="size-4" /> Add item
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save schedule"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
