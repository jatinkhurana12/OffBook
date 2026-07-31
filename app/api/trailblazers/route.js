const { query } = require("../../../lib/db");
const { getSession } = require("../../../lib/auth");
import { NextResponse } from "next/server";

export async function GET() {
  const session = getSession();

  const result = await query(
    `SELECT users.id, users.name, profiles.niche, profiles.headline, profiles.avatar_url
     FROM users JOIN profiles ON profiles.user_id = users.id
     WHERE profiles.is_trailblazer = TRUE
     ORDER BY users.id DESC`
  );

  // Tag each trailblazer with whether the logged-in user already follows
  // them, same pattern as /api/members, so the page can render
  // "Follow" vs "Following" without a second round trip per card.
  let followedIds = new Set();
  if (session) {
    const followResult = await query("SELECT followed_id FROM follows WHERE follower_id = $1", [
      session.id,
    ]);
    followedIds = new Set(followResult.rows.map((r) => r.followed_id));
  }

  const trailblazers = result.rows.map((t) => ({ ...t, is_following: followedIds.has(t.id) }));

  return NextResponse.json({ trailblazers });
}