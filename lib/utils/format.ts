export function formatEventDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number)
  const date = new Date(year, (month ?? 1) - 1, day ?? 1)
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
}

export function formatEventTime(time?: string | null): string | null {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null
  const [hour, minute] = time.split(":").map(Number)
  const date = new Date(2000, 0, 1, hour, minute)
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}
