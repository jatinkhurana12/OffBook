const { query } = require("../../../lib/db");
const { getSession, clearSessionCookie } = require("../../../lib/auth");
import { NextResponse } from "next/server";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const result = await query(
    `SELECT users.id, users.name, users.email, profiles.* FROM users
     JOIN profiles ON profiles.user_id = users.id
     WHERE users.id = $1`,
    [session.id]
  );

  return NextResponse.json({ profile: result.rows[0] });
}

export async function PUT(request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const {
    headline,
    bio,
    left_because,
    skills,
    looking_for,
    availability,
    links,
    shipped,
    avatar_url,
  } = await request.json();

  // avatar_url is a data: URL (base64) capped client-side at 2MB; guard
  // server-side too so no one can bypass the client check.
  if (avatar_url && avatar_url.length > 2_800_000) {
    return NextResponse.json({ error: "Image is too large. Please use a smaller picture." }, { status: 400 });
  }

  await query(
    `UPDATE profiles SET headline = $1, bio = $2, left_because = $3, skills = $4,
       looking_for = $5, availability = $6, links = $7, shipped = $8, avatar_url = $9
     WHERE user_id = $10`,
    [
      headline || "",
      bio || "",
      left_because || "",
      skills || "",
      looking_for || "",
      availability || "exploring",
      links || "",
      shipped || "",
      avatar_url || "",
      session.id,
    ]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  // ON DELETE CASCADE on profiles/problems/comments/internships/problem_votes
  // means this one query cleans up everything tied to the account.
  await query("DELETE FROM users WHERE id = $1", [session.id]);

  clearSessionCookie();

  return NextResponse.json({ ok: true });
}