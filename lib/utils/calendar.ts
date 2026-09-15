interface CalendarEventInput {
  title: string
  description?: string | null
  venue?: string | null
  eventDate: string // "YYYY-MM-DD"
  eventTime?: string | null // "HH:MM" 24h, optional
}

// No timezone field in v1 — these are treated as "floating" local time,
// which is the right default for a single-location family/community
// event where the host and guests share a timezone.
const DEFAULT_DURATION_HOURS = 3

function toDateTimeParts(eventDate: string, eventTime?: string | null) {
  const [year, month, day] = eventDate.split("-").map(Number)
  const [hour, minute] = (eventTime && /^\d{2}:\d{2}$/.test(eventTime) ? eventTime : "09:00")
    .split(":")
    .map(Number)

  const start = new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 9, minute ?? 0)
  const end = new Date(start.getTime() + DEFAULT_DURATION_HOURS * 60 * 60 * 1000)
  return { start, end }
}

function formatFloating(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}00`
  )
}

export function buildGoogleCalendarUrl(input: CalendarEventInput): string {
  const { start, end } = toDateTimeParts(input.eventDate, input.eventTime)
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${formatFloating(start)}/${formatFloating(end)}`,
    details: input.description ?? "",
    location: input.venue ?? "",
  })
  return `https://www.google.com/calendar/render?${params.toString()}`
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

/** A downloadable .ics file body — works with Apple Calendar, Outlook, and most other calendar apps. */
export function buildIcsContent(input: CalendarEventInput, uid: string): string {
  const { start, end } = toDateTimeParts(input.eventDate, input.eventTime)
  const now = formatFloating(new Date()) + "Z"

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Event Platform//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatFloating(start)}`,
    `DTEND:${formatFloating(end)}`,
    `SUMMARY:${escapeIcsText(input.title)}`,
    input.description ? `DESCRIPTION:${escapeIcsText(input.description)}` : "",
    input.venue ? `LOCATION:${escapeIcsText(input.venue)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean)

  return lines.join("\r\n")
}
