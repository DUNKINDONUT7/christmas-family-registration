import Link from "next/link"
import { ArrowRight, CalendarCheck, QrCode, Users2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth/dal"

export default async function LandingPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-[#12211a] text-[#f5ecd8]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(201,154,68,0.25), transparent 40%), radial-gradient(circle at 85% 75%, rgba(201,154,68,0.18), transparent 45%)",
          }}
        />

        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="font-display text-xl font-semibold tracking-tight">Admit One</span>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild variant="secondary" className="bg-[#f5ecd8] text-[#12211a] hover:bg-[#f5ecd8]/90">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-[#f5ecd8] hover:bg-white/10 hover:text-[#f5ecd8]">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-[#c99a44] text-[#12211a] hover:bg-[#c99a44]/90">
                  <Link href="/signup">Create your event</Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        <div className="relative mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-10 md:grid-cols-[1.1fr_0.9fr] md:pb-32 md:pt-16">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-[#c99a44]">
              Registration &amp; scheduling, for any gathering
            </p>
            <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
              Plan the party.
              <br />
              Let the link handle the guest list.
            </h1>
            <p className="mt-6 max-w-lg text-balance text-lg leading-relaxed text-[#f5ecd8]/80">
              Create an event, share one link, and watch registrations come in — each guest gets a real
              ticket, you get one dashboard to approve, message, and keep everyone on schedule.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="bg-[#c99a44] text-[#12211a] hover:bg-[#c99a44]/90">
                <Link href="/signup">
                  Create your event <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-[#f5ecd8] hover:bg-white/10 hover:text-[#f5ecd8]"
              >
                <Link href="/login">Host login</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-[#f5ecd8]/55">
              Free to use. No app to install — guests register from any browser, on any phone.
            </p>
          </div>

          <div className="flex items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <SampleTicket />
          </div>
        </div>
      </section>

      {/* ---------------- What's on a ticket = how it works ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Three fields, one ticket
          </p>
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Everything printed on a ticket has to come from somewhere.
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <TicketFieldCard
            icon={<CalendarCheck className="size-5" />}
            field="EVENT"
            title="You set the event"
            description="Title, date, venue, dress code, and a full run-of-show — edit anytime, guests always see the latest version."
          />
          <TicketFieldCard
            icon={<Users2 className="size-5" />}
            field="ADMIT"
            title="They register"
            description="Guests share their name and who's coming with them. You approve, edit, or decline from one list — no spreadsheet."
          />
          <TicketFieldCard
            icon={<QrCode className="size-5" />}
            field="NO."
            title="A real ticket, generated"
            description="Every approved guest gets a unique ticket number and QR code — useful for a raffle, a door list, or just a nice keepsake."
          />
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
              Your next gathering deserves better than a group chat headcount.
            </h2>
          </div>
          <Button asChild size="lg">
            <Link href="/signup">
              Create your event <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
        <p>Admit One — built for family gatherings, reunions, and everything in between.</p>
      </footer>
    </div>
  )
}

function TicketFieldCard({
  icon,
  field,
  title,
  description,
}: {
  icon: React.ReactNode
  field: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
        {icon}
        {field}
      </div>
      <h3 className="mb-2 font-display text-lg font-medium">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

function SampleTicket() {
  return (
    <div className="w-full max-w-sm -rotate-2 rounded-2xl bg-[#f5ecd8] p-6 text-[#12211a] shadow-2xl transition-transform duration-500 hover:rotate-0">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#12211a]/50">Event</p>
          <p className="font-display text-xl font-medium">Garcia Family Christmas</p>
        </div>
        <span className="rounded-full bg-[#2f6b4f] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#f5ecd8]">
          Confirmed
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#12211a]/50">Admit</p>
          <p className="font-medium">The Garcia Family (5)</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#12211a]/50">Date</p>
          <p className="font-medium">Dec 20, 6:00 PM</p>
        </div>
      </div>

      <div className="ticket-perforation my-5" />

      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#12211a]/50">No.</p>
          <p className="font-mono text-lg font-semibold tracking-wider">GARCIA-2026-0451</p>
        </div>
        <div className="grid size-12 grid-cols-4 grid-rows-4 gap-0.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className={`rounded-[1px] ${[0,1,3,4,6,9,10,12,13,15].includes(i) ? "bg-[#12211a]" : "bg-transparent"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
