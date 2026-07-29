const { query } = require("../../../lib/db");
const { getSession } = require("../../../lib/auth");
import { NextResponse } from "next/server";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const result = await query(
    `SELECT users.id, users.name, profiles.headline, profiles.availability, profiles.avatar_url,
            follows.created_at AS followed_at
     FROM follows
     JOIN users ON users.id = follows.followed_id
     JOIN profiles ON profiles.user_id = users.id
     WHERE follows.follower_id = $1
     ORDER BY follows.created_at DESC`,
    [session.id]
  );

  return NextResponse.json({ folks: result.rows });
}