"use client"

import { QRCodeSVG } from "qrcode.react"
import { Badge } from "@/components/ui/badge"
import { getThemeGradient, type ThemeColor } from "@/lib/constants"
import { formatEventDate, formatEventTime } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface TicketStubProps {
  eventTitle: string
  eventDate: string
  eventTime?: string | null
  themeColor: ThemeColor
  customColorHex?: string | null
  registrantName: string
  memberCount: number
  ticketCode?: string
  status?: "pending" | "approved" | "rejected"
  qrValue?: string
  className?: string
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending approval",
  approved: "Confirmed",
  rejected: "Not approved",
}

export function TicketStub({
  eventTitle,
  eventDate,
  eventTime,
  themeColor,
  customColorHex,
  registrantName,
  memberCount,
  ticketCode,
  status,
  qrValue,
  className,
}: TicketStubProps) {
  const gradient = getThemeGradient(themeColor, customColorHex)
  const time = formatEventTime(eventTime)

  return (
    <div className={cn("w-full max-w-sm rounded-2xl bg-[#f5ecd8] p-6 text-[#12211a] shadow-xl", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-[#12211a]/50">
            <span className="inline-block size-2 rounded-full" style={{ background: gradient }} />
            Event
          </p>
          <p className="truncate font-display text-lg font-medium">{eventTitle || "Your event"}</p>
        </div>
        {status && (
          <Badge
            className={cn(
              "shrink-0 border-0 font-mono text-[10px] uppercase tracking-widest",
              status === "approved" && "bg-[#2f6b4f] text-[#f5ecd8]",
              status === "pending" && "bg-[#c99a44] text-[#12211a]",
              status === "rejected" && "bg-[#8f3b26] text-[#f5ecd8]"
            )}
          >
            {STATUS_LABEL[status]}
          </Badge>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#12211a]/50">Admit</p>
          <p className="truncate font-medium">
            {registrantName || "—"}
            {memberCount > 1 ? ` (${memberCount})` : ""}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#12211a]/50">Date</p>
          <p className="font-medium">
            {eventDate ? formatEventDate(eventDate) : "—"}
            {time ? `, ${time}` : ""}
          </p>
        </div>
      </div>

      {/* Perforation notches are hard-coded to match this card's own
          #f5ecd8 background (not the shared .ticket-perforation utility,
          which punches through to var(--background) — this card appears
          on surfaces that don't match that token). */}
      <div className="relative my-5 border-t-2 border-dashed border-[#12211a]/20">
        <span className="absolute -left-[10px] -top-[10px] size-5 rounded-full bg-[#f5ecd8] shadow-[inset_0_0_0_2px_rgba(18,33,26,0.14)]" />
        <span className="absolute -right-[10px] -top-[10px] size-5 rounded-full bg-[#f5ecd8] shadow-[inset_0_0_0_2px_rgba(18,33,26,0.14)]" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#12211a]/50">No.</p>
          <p className="truncate font-mono text-base font-semibold tracking-wider sm:text-lg">
            {ticketCode ?? "—"}
          </p>
        </div>
        {qrValue && (
          <div className="rounded-md bg-white p-1.5">
            <QRCodeSVG value={qrValue} size={56} />
          </div>
        )}
      </div>
    </div>
  )
}
