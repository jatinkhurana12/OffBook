const bcrypt = require("bcryptjs");
const { query } = require("../../../../lib/db");
const { createSessionCookie } = require("../../../../lib/auth");
import { NextResponse } from "next/server";

export async function POST(request) {
  const { email, password } = await request.json();
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
