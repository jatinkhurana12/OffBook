const { query } = require("../../../../lib/db");
const { getSession } = require("../../../../lib/auth");
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const problemResult = await query(
    `SELECT problems.*, users.name AS author_name, users.id AS author_id
     FROM problems JOIN users ON users.id = problems.user_id
     WHERE problems.id = $1`,
    [params.id]
  );
  const problem = problemResult.rows[0];
  if (!problem) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const voteCounts = await query(
    `SELECT
       COUNT(*) FILTER (WHERE vote_type = 1) AS upvotes,
       COUNT(*) FILTER (WHERE vote_type = -1) AS downvotes
     FROM problem_votes WHERE problem_id = $1`,
    [params.id]
  );
  problem.upvotes = Number(voteCounts.rows[0].upvotes);
  problem.downvotes = Number(voteCounts.rows[0].downvotes);

  const session = getSession();
  problem.my_vote = 0;
  if (session) {
    const myVoteResult = await query(
      "SELECT vote_type FROM problem_votes WHERE problem_id = $1 AND user_id = $2",
      [params.id, session.id]
    );
    problem.my_vote = myVoteResult.rows[0]?.vote_type || 0;
  }

  const commentsResult = await query(
    `SELECT comments.*, users.name AS author_name
     FROM comments JOIN users ON users.id = comments.user_id
     WHERE comments.problem_id = $1
     ORDER BY comments.created_at ASC`,
    [params.id]
  );

  return NextResponse.json({ problem, comments: commentsResult.rows });
}

export async function PUT(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const existing = await query("SELECT user_id FROM problems WHERE id = $1", [params.id]);
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (existing.rows[0].user_id !== session.id) {
    return NextResponse.json({ error: "You can only edit your own posts." }, { status: 403 });
  }

  const { title, domain, severity, description, seeking } = await request.json();
  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
  }

  await query(
    `UPDATE problems SET title = $1, domain = $2, severity = $3, description = $4, seeking = $5
     WHERE id = $6`,
    [title.trim(), domain || "other", severity || "annoying", description.trim(), seeking || "", params.id]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const existing = await query("SELECT user_id FROM problems WHERE id = $1", [params.id]);
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (existing.rows[0].user_id !== session.id) {
    return NextResponse.json({ error: "You can only delete your own posts." }, { status: 403 });
  }

  await query("DELETE FROM problems WHERE id = $1", [params.id]);
  return NextResponse.json({ ok: true });
}