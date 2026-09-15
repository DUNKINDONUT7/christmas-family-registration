import { customAlphabet } from "nanoid"

// Unambiguous lowercase alphabet (no 0/o/1/l/i confusion) for the
// random suffix that keeps event slugs unique and hard to guess.
const suffixAlphabet = "23456789abcdefghjkmnpqrstuvwxyz"
const generateSuffix = customAlphabet(suffixAlphabet, 6)

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)

  return base || "event"
}

/** A slug that's readable (from the title) but not guessable (random suffix). */
export function generateEventSlug(title: string): string {
  return `${slugify(title)}-${generateSuffix()}`
}
