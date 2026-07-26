const { query } = require("../../../../../lib/db");
const { getSession } = require("../../../../../lib/auth");
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const { voteType } = await request.json();
  if (voteType !== 1 && voteType !== -1) {
    return NextResponse.json({ error: "Invalid vote." }, { status: 400 });
  }

  const existing = await query(
    "SELECT vote_type FROM problem_votes WHERE problem_id = $1 AND user_id = $2",
    [params.id, session.id]
  );

  if (existing.rows.length > 0) {
    if (existing.rows[0].vote_type === voteType) {
      // Clicking the same arrow again removes your vote entirely.
      await query("DELETE FROM problem_votes WHERE problem_id = $1 AND user_id = $2", [
        params.id,
        session.id,
      ]);
    } else {
      // Switching from up to down or vice versa.
      await query(
        "UPDATE problem_votes SET vote_type = $1 WHERE problem_id = $2 AND user_id = $3",
        [voteType, params.id, session.id]
      );
    }
  } else {
    await query(
      "INSERT INTO problem_votes (problem_id, user_id, vote_type) VALUES ($1, $2, $3)",
      [params.id, session.id, voteType]
    );
  }

  const counts = await query(
    `SELECT
       COUNT(*) FILTER (WHERE vote_type = 1) AS upvotes,
       COUNT(*) FILTER (WHERE vote_type = -1) AS downvotes
     FROM problem_votes WHERE problem_id = $1`,
    [params.id]
  );

  const myVoteResult = await query(
    "SELECT vote_type FROM problem_votes WHERE problem_id = $1 AND user_id = $2",
    [params.id, session.id]
  );

  return NextResponse.json({
    ok: true,
    upvotes: Number(counts.rows[0].upvotes),
    downvotes: Number(counts.rows[0].downvotes),
    myVote: myVoteResult.rows[0]?.vote_type || 0,
  });
}