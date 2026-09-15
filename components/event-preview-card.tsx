import { CalendarDays, MapPin, Shirt, UtensilsCrossed } from "lucide-react"
import { getThemeGradient, CATERING_STYLE_META, type ThemeColor, type CateringStyle } from "@/lib/constants"
import { formatEventDate, formatEventTime } from "@/lib/utils/format"

interface EventPreviewCardProps {
  title: string
  description?: string
  eventDate?: string
  eventTime?: string
  venue?: string
  dressCode?: string
  cateringStyle?: CateringStyle | ""
  themeColor: ThemeColor
  customColorHex?: string | null
}

export function EventPreviewCard({
  title,
  description,
  eventDate,
  eventTime,
  venue,
  dressCode,
  cateringStyle,
  themeColor,
  customColorHex,
}: EventPreviewCardProps) {
  const gradient = getThemeGradient(themeColor, customColorHex)
  const formattedDate = eventDate ? formatEventDate(eventDate) : null
  const formattedTime = formatEventTime(eventTime)

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
      <div className="p-5 text-white" style={{ background: gradient }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">You're invited</p>
        <h3 className="mt-1 truncate font-display text-lg font-medium">{title || "Your event title"}</h3>
        {description && <p className="mt-1.5 line-clamp-2 text-xs text-white/85">{description}</p>}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/90">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {formattedDate ?? "Date not set"}
            {formattedTime ? `, ${formattedTime}` : ""}
          </span>
          {venue && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {venue}
            </span>
          )}
          {dressCode && (
            <span className="flex items-center gap-1">
              <Shirt className="size-3.5" />
              {dressCode}
            </span>
          )}
          {cateringStyle && (
            <span className="flex items-center gap-1">
              <UtensilsCrossed className="size-3.5" />
              {CATERING_STYLE_META[cateringStyle].label}
            </span>
          )}
        </div>
      </div>
      <p className="bg-card px-5 py-2 text-center text-[11px] text-muted-foreground">
        This is what guests see at the top of your registration page
      </p>
    </div>
  )
}
