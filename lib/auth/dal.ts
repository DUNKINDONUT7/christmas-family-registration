import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { createSessionToken, verifySessionToken, sessionCookie } from "./session"

/** Sets the signed session cookie for a logged-in user. Call after signup/login. */
export async function startSession(userId: string) {
  const token = await createSessionToken({ userId })
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie.name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionCookie.maxAgeSeconds,
  })
}

/** Clears the session cookie. Call on logout. */
export async function endSession() {
  const cookieStore = await cookies()
  cookieStore.delete(sessionCookie.name)
}

/**
 * Verifies the session cookie only (no DB read). Cheap — safe to call
 * often, e.g. to decide whether to show "Log in" vs "Dashboard" in a
 * header. Does NOT prove the user still exists; use getCurrentUser for
 * anything that reads or writes real data.
 */
export const getSession = cache(async (): Promise<{ userId: string } | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(sessionCookie.name)?.value
  if (!token) return null
  return verifySessionToken(token)
})

/**
 * Loads the current user's full row from the database. Cached per
 * request via React's cache() so multiple components can call this
 * without duplicating the query. Returns null if not logged in or if
 * the account no longer exists.
 */
export const getCurrentUser = cache(async () => {
  const session = await getSession()
  if (!session) return null

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  return user ?? null
})

/**
 * Use at the top of any protected Server Component or Server Action.
 * Redirects to /login if there is no valid, still-existing user.
 */
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}
