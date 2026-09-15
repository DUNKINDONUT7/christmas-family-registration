import { SignJWT, jwtVerify } from "jose"

const SESSION_COOKIE_NAME = "session"
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60 // 30 days

export interface SessionPayload {
  userId: string
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Generate one with:\n" +
      "  node -e \"console.log(require('crypto').randomBytes(32).toString('base64url'))\"\n" +
      "and add it to .env.local (locally) or your Vercel project's environment variables."
    )
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey())
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    if (typeof payload.userId !== "string") return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}

export const sessionCookie = {
  name: SESSION_COOKIE_NAME,
  maxAgeSeconds: SESSION_DURATION_SECONDS,
}
