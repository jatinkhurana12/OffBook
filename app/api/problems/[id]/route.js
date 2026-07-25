const { query } = require("../../../../lib/db");
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

  const commentsResult = await query(
    `SELECT comments.*, users.name AS author_name
     FROM comments JOIN users ON users.id = comments.user_id
     WHERE comments.problem_id = $1
     ORDER BY comments.created_at ASC`,
    [params.id]
  );

  return NextResponse.json({ problem, comments: commentsResult.rows });
}
