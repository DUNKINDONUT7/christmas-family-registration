import "server-only"
import nodemailer, { type Transporter } from "nodemailer"

// Gmail SMTP — same pattern as the FairPlay project's notify-* functions:
// GMAIL_USER + a 16-character App Password (not the account's real login
// password), which requires 2-Step Verification to be on. Generate one at
// myaccount.google.com/apppasswords.
let transporter: Transporter | null | undefined

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env
  transporter =
    GMAIL_USER && GMAIL_APP_PASSWORD
      ? nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
        })
      : null
  return transporter
}

interface SendEmailInput {
  to: string
  subject: string
  html: string
}

/**
 * Sends an email if GMAIL_USER/GMAIL_APP_PASSWORD are configured;
 * otherwise logs and no-ops. Never throws — a missing/failed email
 * should never break a registration, approval, or invite flow.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const client = getTransporter()
  if (!client) {
    console.log(
      `[email disabled] Would send "${subject}" to ${to}. Set GMAIL_USER and GMAIL_APP_PASSWORD to enable real email.`
    )
    return
  }

  const fromAddress = process.env.EMAIL_FROM || `Admit One <${process.env.GMAIL_USER}>`

  try {
    await client.sendMail({ from: fromAddress, to, subject, html })
  } catch (error) {
    console.error(`Failed to send email "${subject}" to ${to}:`, error)
  }
}

const INK = "#12211a"
const PAPER = "#f5ecd8"
const BRASS = "#b8860b"
const BODY_TEXT = "#3f3a2f"
const MUTED_TEXT = "#7a7568"
const BORDER = "#e7e0cf"

/**
 * Shared card shell for every email: a branded header bar, the message
 * body, and a footer — built with table-free but email-client-safe
 * inline styles (no flexbox/grid, which Outlook and some webmail
 * clients don't support).
 */
function emailShell(bodyHtml: string, options?: { preheader?: string }): string {
  return `
  <div style="background:#f4f1e8;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
    ${options?.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(options.preheader)}</div>` : ""}
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
      <div style="background:${INK};padding:22px 32px;">
        <span style="color:${PAPER};font-size:13px;letter-spacing:3px;text-transform:uppercase;font-family:'Courier New',monospace;">Admit One</span>
      </div>
      <div style="padding:36px 32px;color:${BODY_TEXT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;">
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px;border-top:1px solid ${BORDER};background:#faf8f2;">
        <p style="margin:0;font-size:12px;color:${MUTED_TEXT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
          This is an automated message about an event registration. If it wasn't meant for you, you can ignore it.
        </p>
      </div>
    </div>
  </div>
  `
}

function emailHeading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:normal;color:${INK};">${escapeHtml(text)}</h1>`
}

function emailButton(url: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="background:${INK};border-radius:8px;">
          <a href="${url}" style="display:inline-block;padding:13px 28px;color:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `
}

function emailTicketCode(code: string): string {
  return `
    <div style="margin:24px 0;padding:18px 20px;background:${PAPER};border-radius:8px;border:1px dashed ${BRASS};text-align:center;">
      <span style="font-family:'Courier New',monospace;font-size:20px;font-weight:700;letter-spacing:2px;color:${INK};">${escapeHtml(code)}</span>
    </div>
  `
}

function emailFootnote(text: string): string {
  return `<p style="margin:20px 0 0;font-size:13px;color:${MUTED_TEXT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${text}</p>`
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
    html: emailShell(
      `
      ${emailHeading(`Thank you, ${params.registrantName}`)}
      <p style="margin:0 0 8px;">Your registration for <strong>${escapeHtml(params.eventTitle)}</strong> has been received and is currently <strong>pending approval</strong> from the host.</p>
      <p style="margin:16px 0 4px;font-size:13px;color:${MUTED_TEXT};text-transform:uppercase;letter-spacing:1px;">Your ticket code</p>
      ${emailTicketCode(params.ticketCode)}
      <p style="margin:0;">Please keep this code — you'll need it, along with your email, to look up your registration status.</p>
      ${emailButton(params.statusCheckUrl, "Check registration status")}
      ${emailFootnote("You'll also receive a separate email as soon as the host makes a decision.")}
    `,
      { preheader: `Your ticket code: ${params.ticketCode}` }
    ),
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
    subject: isApproved ? `You're confirmed for ${params.eventTitle}` : `Update on your registration for ${params.eventTitle}`,
    html: emailShell(`
      ${emailHeading(isApproved ? "You're confirmed" : "Registration update")}
      <p style="margin:0;">Hello ${escapeHtml(params.registrantName)}, your registration for <strong>${escapeHtml(params.eventTitle)}</strong> has been <strong>${params.status}</strong>.</p>
      ${emailButton(params.confirmationUrl, "View your ticket")}
      ${!isApproved ? emailFootnote("If you have questions about this decision, please reach out to the host directly.") : ""}
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
      ${emailHeading("You've been invited as a co-host")}
      <p style="margin:0;"><strong>${escapeHtml(params.inviterName)}</strong> has invited you to help manage <strong>${escapeHtml(params.eventTitle)}</strong> — you'll be able to review guests and edit the schedule.</p>
      ${emailButton(params.inviteUrl, "Accept invitation")}
      ${emailFootnote("This link is single-use and expires in 7 days.")}
    `),
  })
}

export async function sendPasswordResetEmail(params: { to: string; resetUrl: string }) {
  await sendEmail({
    to: params.to,
    subject: "Reset your password",
    html: emailShell(`
      ${emailHeading("Reset your password")}
      <p style="margin:0;">We received a request to reset your password. Click below to choose a new one — this link expires in 1 hour.</p>
      ${emailButton(params.resetUrl, "Reset password")}
      ${emailFootnote("If you didn't request this, no action is needed — your password will remain unchanged.")}
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
