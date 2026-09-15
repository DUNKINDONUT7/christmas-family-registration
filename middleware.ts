import { NextResponse, type NextRequest } from "next/server"
import { verifySessionToken, sessionCookie } from "@/lib/auth/session"

// Optimistic, edge-level gate: fast-redirects unauthenticated visitors
// away from /dashboard before the page even renders. This is a UX/
// defense-in-depth layer only — every protected Server Action and page
// also calls requireUser() (lib/auth/dal.ts), which re-checks against
// the database and is the source of truth for authorization.
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(sessionCookie.name)?.value
  const session = token ? await verifySessionToken(token) : null

  const { pathname } = request.nextUrl
  const isProtectedRoute = pathname.startsWith("/dashboard")

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
