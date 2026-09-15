"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth"
import { forgotPasswordAction } from "../actions"

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [sentMessage, setSentMessage] = useState<string | null>(null)
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      const result = await forgotPasswordAction(values)
      if (result.success) {
        setSentMessage(result.message ?? "Check your email for a reset link.")
      } else if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof ForgotPasswordInput, { message })
        }
      }
    })
  }

  if (sentMessage) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-medium tracking-tight">Check your email</h1>
        <p className="mt-3 text-sm text-muted-foreground">{sentMessage}</p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-medium tracking-tight">Reset your password</h1>
      <p className="mt-1 text-sm text-muted-foreground">We'll email you a link to choose a new one.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}
