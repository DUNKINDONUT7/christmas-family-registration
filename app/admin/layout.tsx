import { notFound } from "next/navigation"
import Link from "next/link"
import { requireUser } from "@/lib/auth/dal"
import { Button } from "@/components/ui/button"
import { logoutAction } from "../(auth)/actions"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  // Not found (not "forbidden") — don't reveal that this route exists to non-admins.
  if (user.platformRole !== "admin") notFound()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-[#12211a] text-[#f5ecd8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-display text-lg font-semibold tracking-tight">
              Admit One
            </Link>
            <span className="rounded-full bg-[#c99a44] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#12211a]">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-[#f5ecd8]/80 hover:text-[#f5ecd8]">
              Your events
            </Link>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" className="text-[#f5ecd8] hover:bg-white/10 hover:text-[#f5ecd8]">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
