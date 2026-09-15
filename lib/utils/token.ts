import { createHash, randomBytes } from "node:crypto"

/** A random, URL-safe raw token to put in an emailed/shared link. */
export function generateRawToken(): string {
  return randomBytes(32).toString("base64url")
}

/**
 * We only ever store this hash in the database, never the raw token —
 * so a database leak alone can't be used to claim an invite or reset a
 * password. Deterministic (unsalted) on purpose: it's looked up by
 * exact match, not compared like a password hash.
 */
export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex")
}
