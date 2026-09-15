"use server"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users, passwordResetTokens } from "@/lib/db/schema"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { startSession, endSession } from "@/lib/auth/dal"
import { generateRawToken, hashToken } from "@/lib/utils/token"
import { sendPasswordResetEmail } from "@/lib/email"
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignupInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth"
import { zodErrorToFieldErrors, type ActionResult } from "@/lib/action-result"

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

export async function signupAction(input: SignupInput): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "Please fix the errors below.", fieldErrors: zodErrorToFieldErrors(parsed.error) }
  }

  const { name, email, password } = parsed.data
  const normalizedEmail = email.toLowerCase()

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1)
  if (existing) {
    return {
      success: false,
      message: "That email is already registered.",
      fieldErrors: { email: "An account with this email already exists." },
    }
  }

  const passwordHash = await hashPassword(password)
  const [user] = await db
    .insert(users)
    .values({ name, email: normalizedEmail, passwordHash })
    .returning({ id: users.id })

  await startSession(user.id)
  redirect("/dashboard")
}

/** redirectTo must be a same-site relative path — never pass a user-controlled absolute URL here. */
export async function loginAction(input: LoginInput, redirectTo?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "Please fix the errors below.", fieldErrors: zodErrorToFieldErrors(parsed.error) }
  }

  const normalizedEmail = parsed.data.email.toLowerCase()
  const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1)

  // Same generic message whether the email doesn't exist or the password
  // is wrong — don't reveal which one it was.
  const genericError = {
    success: false as const,
    message: "Incorrect email or password.",
    fieldErrors: { _form: "Incorrect email or password." },
  }

  if (!user) return genericError

  const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash)
  if (!passwordMatches) return genericError

  await startSession(user.id)

  // Only ever redirect to a path on this site (must start with a single
  // "/", never "//" — that's a protocol-relative URL to an external host).
  const safeDestination = redirectTo && /^\/(?!\/)/.test(redirectTo) ? redirectTo : "/dashboard"
  redirect(safeDestination)
}

export async function logoutAction(): Promise<void> {
  await endSession()
  redirect("/")
}

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "Please fix the errors below.", fieldErrors: zodErrorToFieldErrors(parsed.error) }
  }

  const normalizedEmail = parsed.data.email.toLowerCase()
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1)

  // Always report success — never reveal whether an email is registered.
  if (user) {
    const rawToken = generateRawToken()
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${rawToken}`
    await sendPasswordResetEmail({ to: normalizedEmail, resetUrl })
  }

  return {
    success: true,
    message: "If that email is registered, we've sent a link to reset your password.",
  }
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "Please fix the errors below.", fieldErrors: zodErrorToFieldErrors(parsed.error) }
  }

  const tokenHash = hashToken(parsed.data.token)
  const [record] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1)

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { success: false, message: "This reset link is invalid or has expired. Please request a new one." }
  }

  const passwordHash = await hashPassword(parsed.data.password)
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, record.userId))
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id))

  return { success: true, message: "Your password has been reset. You can now log in." }
}
