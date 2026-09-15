import Link from "next/link"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent">
          <Compass className="size-6 text-accent-foreground" />
        </div>
        <h1 className="font-display text-xl font-medium">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link doesn't lead anywhere — it may have been moved, deleted, or mistyped.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  )
}
