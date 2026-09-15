import { customAlphabet } from "nanoid"

const digits = customAlphabet("0123456789", 4)

/** Derives a short, all-caps prefix from an event title for ticket codes. */
export function deriveTicketPrefix(title: string): string {
  const firstWord = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]+/g, " ")
    .trim()
    .split(" ")[0]

  const prefix = (firstWord || "EVENT").toUpperCase().slice(0, 8)
  return prefix.length >= 3 ? prefix : "EVENT"
}

/** Formats a ticket code, e.g. GARCIA-2026-4821. Uniqueness is enforced by the caller (DB constraint + retry). */
export function generateTicketCode(ticketPrefix: string, year: number = new Date().getFullYear()): string {
  return `${ticketPrefix}-${year}-${digits()}`
}
