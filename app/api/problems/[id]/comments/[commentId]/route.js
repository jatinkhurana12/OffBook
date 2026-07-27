const { query } = require("../../../../../../lib/db");
const { getSession } = require("../../../../../../lib/auth");
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const existing = await query("SELECT user_id FROM comments WHERE id = $1", [params.commentId]);
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (existing.rows[0].user_id !== session.id) {
    return NextResponse.json({ error: "You can only edit your own replies." }, { status: 403 });
  }

  const { body } = await request.json();
  if (!body || !body.trim()) {
    return NextResponse.json({ error: "Reply can't be empty." }, { status: 400 });
  }

  await query("UPDATE comments SET body = $1 WHERE id = $2", [body.trim(), params.commentId]);

  const result = await query(
    `SELECT comments.*, users.name AS author_name
     FROM comments JOIN users ON users.id = comments.user_id
     WHERE comments.problem_id = $1
     ORDER BY comments.created_at ASC`,
    [params.id]
  );

  return NextResponse.json({ ok: true, comments: result.rows });
}

export async function DELETE(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const existing = await query("SELECT user_id FROM comments WHERE id = $1", [params.commentId]);
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (existing.rows[0].user_id !== session.id) {
    return NextResponse.json({ error: "You can only delete your own replies." }, { status: 403 });
  }

  await query("DELETE FROM comments WHERE id = $1", [params.commentId]);

  const result = await query(
    `SELECT comments.*, users.name AS author_name
     FROM comments JOIN users ON users.id = comments.user_id
     WHERE comments.problem_id = $1
     ORDER BY comments.created_at ASC`,
    [params.id]
  );

  return NextResponse.json({ ok: true, comments: result.rows });
}