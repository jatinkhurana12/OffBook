const bcrypt = require("bcryptjs");
const { query } = require("../../../../lib/db");
const { createSessionCookie } = require("../../../../lib/auth");
const { verifyCaptcha } = require("../../../../lib/captcha");
import { NextResponse } from "next/server";

export async function POST(request) {
  const { email, password, captchaToken, captchaAnswer } = await request.json();

  if (!verifyCaptcha(captchaToken, captchaAnswer)) {
    return NextResponse.json({ error: "That captcha answer isn't right. Try the new one." }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const result = await query("SELECT * FROM users WHERE email = $1", [email.toLowerCase().trim()]);
  const user = result.rows[0];
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  createSessionCookie(user);
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
}