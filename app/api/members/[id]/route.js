const { query } = require("../../../../lib/db");
const { getSession } = require("../../../../lib/auth");
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const session = getSession();
  const memberId = Number(params.id);
  if (!memberId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const result = await query(
    `SELECT users.id, users.name, profiles.headline, profiles.bio, profiles.left_because,
            profiles.skills, profiles.looking_for, profiles.availability, profiles.links,
            profiles.shipped, profiles.avatar_url
     FROM users JOIN profiles ON profiles.user_id = users.id
     WHERE users.id = $1`,
    [memberId]
  );

  const member = result.rows[0];
  if (!member) {
    return NextResponse.json({ error: "That member doesn't exist." }, { status: 404 });
  }

  let following = false;
  if (session) {
    const followResult = await query(
      "SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = $2",
      [session.id, memberId]
    );
    following = followResult.rows.length > 0;
  }

  return NextResponse.json({ member, following, isSelf: session?.id === memberId });
}