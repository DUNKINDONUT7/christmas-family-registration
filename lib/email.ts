import "server-only"
import { Resend } from "resend"

const FROM_ADDRESS = "Event Platform <onboarding@resend.dev>"

let resendClient: Resend | null | undefined

function getResendClient(): Resend | null {
  if (resendClient !== undefined) return resendClient
  const apiKey = process.env.RESEND_API_KEY
  resendClient = apiKey ? new Resend(apiKey) : null
  return resendClient
}

interface SendEmailInput {
  to: string
  subject: string
  html: string
}

/**
 * Sends an email if RESEND_API_KEY is configured; otherwise logs and
 * no-ops. Never throws — a missing/failed email should never break a
 * registration, approval, or invite flow for the person using the app.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const client = getResendClient()
  if (!client) {
    console.log(`[email disabled] Would send "${subject}" to ${to}. Set RESEND_API_KEY to enable real email.`)
    return
  }

  try {
    await client.emails.send({ from: FROM_ADDRESS, to, subject, html })
  } catch (error) {
    console.error(`Failed to send email "${subject}" to ${to}:`, error)
  }
}

function emailShell(bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #9ca3af;">This is an automated message from your event's registration page.</p>
    </div>
  `
}

export async function sendRegistrationReceivedEmail(params: {
  to: string
  registrantName: string
  eventTitle: string
  ticketCode: string
  statusCheckUrl: string
}) {
  await sendEmail({
    to: params.to,
    subject: `We received your registration for ${params.eventTitle}`,
    html: emailShell(`
      <h2 style="color: #0f5c2e;">Thanks, ${escapeHtml(params.registrantName)}! 🎉</h2>
      <p>Your registration for <strong>${escapeHtml(params.eventTitle)}</strong> has been received and is <strong>pending approval</strong> from the host.</p>
      <p style="background: #f3f4f6; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 18px; letter-spacing: 1px;">${escapeHtml(params.ticketCode)}</p>
      <p>Save this ticket code. You'll be able to check your status here:</p>
      <p><a href="${params.statusCheckUrl}" style="color: #b8860b;">${params.statusCheckUrl}</a></p>
    `),
  })
}

export async function sendRegistrationStatusChangedEmail(params: {
  to: string
  registrantName: string
  eventTitle: string
  status: "approved" | "rejected"
  confirmationUrl: string
}) {
  const isApproved = params.status === "approved"
  await sendEmail({
    to: params.to,
    subject: isApproved
      ? `You're confirmed for ${params.eventTitle}! ✅`
      : `Update on your registration for ${params.eventTitle}`,
    html: emailShell(`
      <h2 style="color: ${isApproved ? "#0f5c2e" : "#7f1d1d"};">${isApproved ? "You're in! 🎉" : "Registration update"}</h2>
      <p>Hi ${escapeHtml(params.registrantName)}, your registration for <strong>${escapeHtml(params.eventTitle)}</strong> has been <strong>${params.status}</strong>.</p>
      <p><a href="${params.confirmationUrl}" style="color: #b8860b;">View your registration</a></p>
    `),
  })
}

export async function sendCollaboratorInviteEmail(params: {
  to: string
  eventTitle: string
  inviterName: string
  inviteUrl: string
}) {
  await sendEmail({
    to: params.to,
    subject: `${params.inviterName} invited you to help manage ${params.eventTitle}`,
    html: emailShell(`
      <h2 style="color: #0f5c2e;">You've been invited as a co-host 🎄</h2>
      <p>${escapeHtml(params.inviterName)} invited you to help manage <strong>${escapeHtml(params.eventTitle)}</strong>.</p>
      <p><a href="${params.inviteUrl}" style="color: #b8860b;">Accept invite</a></p>
      <p style="font-size: 13px; color: #6b7280;">This link can only be used once and expires in 7 days.</p>
    `),
  })
}

export async function sendPasswordResetEmail(params: { to: string; resetUrl: string }) {
  await sendEmail({
    to: params.to,
    subject: "Reset your password",
    html: emailShell(`
      <h2 style="color: #0f5c2e;">Reset your password</h2>
      <p>Click below to choose a new password. This link expires in 1 hour.</p>
      <p><a href="${params.resetUrl}" style="color: #b8860b;">Reset password</a></p>
      <p style="font-size: 13px; color: #6b7280;">If you didn't request this, you can safely ignore this email.</p>
    `),
  })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
