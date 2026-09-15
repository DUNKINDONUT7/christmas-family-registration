import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 px-6 py-12">
      <div className="mb-8 flex w-full max-w-sm items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-foreground">
          Admit One
        </Link>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">{children}</div>
    </div>
  )
}
