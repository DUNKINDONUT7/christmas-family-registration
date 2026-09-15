"use client"

import { use, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { registrationStatusLookupSchema } from "@/lib/validations/registration"
import { lookupRegistrationStatusAction } from "../actions"
import { z } from "zod"

const formSchema = registrationStatusLookupSchema.omit({ slug: true })
type FormValues = z.infer<typeof formSchema>

export default function StatusLookupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", ticketCode: "" },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await lookupRegistrationStatusAction({ slug, ...values })
      if (result.success && result.data) {
        router.push(`/e/${slug}/confirmation/${result.data.registrationId}`)
      } else if (!result.success) {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Link
          href={`/e/${slug}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to event page
        </Link>
        <h1 className="font-display text-2xl font-medium tracking-tight">Check your registration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the email and ticket code from your registration email.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
              name="ticketCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket code</FormLabel>
                  <FormControl>
                    <Input placeholder="EVENT-2026-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Looking up…" : "Find my registration"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
