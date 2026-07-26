const bcrypt = require("bcryptjs");
const { query } = require("../../../../lib/db");
const { createSessionCookie } = require("../../../../lib/auth");
const { validatePassword } = require("../../../../lib/validators");
const { verifyCaptcha } = require("../../../../lib/captcha");
import { NextResponse } from "next/server";

export async function POST(request) {
  const { name, email, password, captchaToken, captchaAnswer } = await request.json();

  if (!verifyCaptcha(captchaToken, captchaAnswer)) {
    return NextResponse.json({ error: "That captcha answer isn't right. Try the new one." }, { status: 400 });
  }

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are all required." }, { status: 400 });
  }
  const { valid, errors } = validatePassword(password);
  if (!valid) {
    return NextResponse.json({ error: errors[0] }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = await query("SELECT id FROM users WHERE email = $1", [cleanEmail]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = await query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
    [name.trim(), cleanEmail, hash]
  );
  const userId = result.rows[0].id;
  await query("INSERT INTO profiles (user_id) VALUES ($1)", [userId]);

  const user = { id: userId, name: name.trim(), email: cleanEmail };
  createSessionCookie(user);

  return NextResponse.json({ ok: true, user });
}