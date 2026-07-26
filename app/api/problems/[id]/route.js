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