// Sends transactional email via Resend (https://resend.com — free tier:
// 3,000 emails/month, 100/day, no credit card required).
//
// Setup (2 minutes):
//   1. Create a free account at https://resend.com and verify your email.
//   2. Dashboard -> API Keys -> Create API Key -> copy it.
//   3. Add to .env.local (and to Vercel's Environment Variables for prod):
//        RESEND_API_KEY=re_xxxxxxxxxxxx
//        RESEND_FROM_EMAIL=Offbook <onboarding@resend.dev>
//      "onboarding@resend.dev" is a Resend sandbox sender that works
//      immediately with no domain setup. Once you verify your own domain
//      in Resend, switch this to something like "Offbook <noreply@yourdomain.com>".
//
// If RESEND_API_KEY isn't set (e.g. running locally without it configured),
// this falls back to logging the email to the console instead of throwing —
// so local dev keeps working and you can still copy the reset link manually.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Offbook <onboarding@resend.dev>";

async function sendPasswordResetEmail(toEmail, resetUrl) {
  if (!RESEND_API_KEY) {
    console.warn(
      "[mailer] RESEND_API_KEY is not set — skipping real email send.\n" +
        `[mailer] Password reset link for ${toEmail}:\n[mailer] ${resetUrl}`
    );
    return { skipped: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: "Reset your Offbook password",
      html: buildEmailHtml(resetUrl),
      text: `Reset your Offbook password by visiting this link (valid for 1 hour): ${resetUrl}`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error (${res.status}): ${body}`);
  }

  return res.json();
}

// Fires when someone gets a new in-app message. Doesn't include the message
// content — just a nudge to go read it on Offbook, so the conversation stays
// inside the product instead of spilling into email.
async function sendMessageNotificationEmail({ toEmail, toName, fromName }) {
  if (!RESEND_API_KEY) {
    console.warn(
      "[mailer] RESEND_API_KEY is not set — skipping real email send.\n" +
        `[mailer] ${fromName} sent ${toEmail} a new message on Offbook.`
    );
    return { skipped: true };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://offbook.vercel.app";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `${fromName} sent you a message on Offbook`,
      html: buildMessageNotificationHtml({ toName, fromName, appUrl }),
      text: `Hi ${toName || ""}, ${fromName} sent you a message on Offbook. Read it here: ${appUrl}/messages`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error (${res.status}): ${body}`);
  }

  return res.json();
}

function buildMessageNotificationHtml({ toName, fromName, appUrl }) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #17181A;">
      <h2 style="margin-bottom: 8px;">${fromName} sent you a message</h2>
      <p>Hi ${toName || ""}, you've got a new message waiting on Offbook.</p>
      <p style="margin: 24px 0;">
        <a href="${appUrl}/messages" style="background:#17181A;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px;display:inline-block;">
          Read it on Offbook
        </a>
      </p>
      <p style="font-size: 13px; color: #666;">Messages stay inside Offbook — this email is just a heads up.</p>
    </div>
  `;
}

function buildEmailHtml(resetUrl) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #17181A;">
      <h2 style="margin-bottom: 8px;">Reset your password</h2>
      <p>Someone requested a password reset for your Offbook account. If this was you, click the button below to set a new password. This link expires in 1 hour and can only be used once.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background:#17181A;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px;display:inline-block;">
          Reset Password
        </a>
      </p>
      <p style="font-size: 13px; color: #666;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
      <p style="font-size: 13px; color: #666;">If the button doesn't work, copy and paste this link into your browser:<br />${resetUrl}</p>
    </div>
  `;
}

module.exports = { sendPasswordResetEmail, sendMessageNotificationEmail };