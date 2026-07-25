const bcrypt = require("bcryptjs");
const { query } = require("../../../../lib/db");
const { createSessionCookie } = require("../../../../lib/auth");
import { NextResponse } from "next/server";

export async function POST(request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are all required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password needs to be at least 8 characters." }, { status: 400 });
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
