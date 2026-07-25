const { query } = require("../../../lib/db");
const { getSession } = require("../../../lib/auth");
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

  const { headline, bio, left_because, skills, looking_for, availability, links, shipped } =
    await request.json();

  await query(
    `UPDATE profiles SET headline = $1, bio = $2, left_because = $3, skills = $4,
       looking_for = $5, availability = $6, links = $7, shipped = $8
     WHERE user_id = $9`,
    [
      headline || "",
      bio || "",
      left_because || "",
      skills || "",
      looking_for || "",
      availability || "exploring",
      links || "",
      shipped || "",
      session.id,
    ]
  );

  return NextResponse.json({ ok: true });
}
