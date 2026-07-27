const { query } = require("../../../../lib/db");
const { sendPasswordResetEmail } = require("../../../../lib/mailer");
const { createResetToken, buildResetUrl } = require("../../../../lib/passwordReset");
import { NextResponse } from "next/server";

// Always returns the same generic message whether or not the email exists,
// so this endpoint can't be used to check which emails have accounts.
const GENERIC_MESSAGE =
  "If an account exists for that email, we've sent a link to reset your password.";

export async function POST(request) {
  const { email } = await request.json();
  const cleanEmail = (email || "").toLowerCase().trim();

  if (!cleanEmail) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const userResult = await query("SELECT id, email FROM users WHERE email = $1", [cleanEmail]);
  const user = userResult.rows[0];

  if (user) {
    const { rawToken } = await createResetToken(user.id);
    const origin = process.env.APP_URL || new URL(request.url).origin;
    const resetUrl = buildResetUrl(origin, rawToken);

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (err) {
      console.error("Failed to send password reset email:", err);
    }
  }

  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}