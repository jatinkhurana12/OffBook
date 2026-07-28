const bcrypt = require("bcryptjs");
const { query } = require("../../../../lib/db");
const { consumeResetToken } = require("../../../../lib/passwordReset");
const { validatePassword } = require("../../../../lib/validators");
import { NextResponse } from "next/server";

export async function POST(request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
  }

  const { valid, errors } = validatePassword(password);
  if (!valid) {
    return NextResponse.json({ error: errors[0] }, { status: 400 });
  }

  // Single call: validates the token is unexpired/unused AND marks it used,
  // so a link can never be redeemed twice even if this route is hit twice.
  const userId = await consumeResetToken(token);
  if (!userId) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  const hash = bcrypt.hashSync(password, 10);
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, userId]);

  return NextResponse.json({ ok: true });
}