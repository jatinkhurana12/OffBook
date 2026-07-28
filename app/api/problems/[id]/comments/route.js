const { query } = require("../../../../../lib/db");
const { getSession } = require("../../../../../lib/auth");
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const { body } = await request.json();
  if (!body || !body.trim()) {
    return NextResponse.json({ error: "Comment can't be empty." }, { status: 400 });
  }

  await query("INSERT INTO comments (problem_id, user_id, body) VALUES ($1, $2, $3)", [
    params.id,
    session.id,
    body.trim(),
  ]);

const result = await query(
     `SELECT comments.*, users.name AS author_name, profiles.avatar_url AS author_avatar_url
      FROM comments
      JOIN users ON users.id = comments.user_id
      LEFT JOIN profiles ON profiles.user_id = users.id
      WHERE comments.problem_id = $1
      ORDER BY comments.created_at ASC`,
     [params.id]
   );

  return NextResponse.json({ ok: true, comments: result.rows });
}
