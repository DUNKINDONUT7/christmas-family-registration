"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EventError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-6 text-destructive" />
        </div>
        <h1 className="font-display text-xl font-medium">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This wasn't your fault — nothing you entered was lost. Please try again.
        </p>
        <Button onClick={reset} className="mt-6 w-full">
          Try again
        </Button>
      </div>
    </div>
  )
}
