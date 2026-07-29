const { query } = require("../../../lib/db");
const { getSession } = require("../../../lib/auth");
import { NextResponse } from "next/server";

export async function GET(request) {
  const session = getSession();
  const { searchParams } = new URL(request.url);
  const skill = (searchParams.get("skill") || "").trim().toLowerCase();

let sql = `
     SELECT users.id, users.name, profiles.headline, profiles.skills, profiles.looking_for,
            profiles.availability, profiles.left_because, profiles.shipped, profiles.avatar_url
     FROM users JOIN profiles ON profiles.user_id = users.id
   `;
  const args = [];
  if (skill) {
    sql += " WHERE LOWER(profiles.skills) LIKE $1";
    args.push(`%${skill}%`);
  }
  sql += " ORDER BY users.id DESC";

  const result = await query(sql, args);

  // Tag each member with whether the logged-in user already follows them,
  // so the directory can render "Follow" vs "Following" without a second
  // round trip per row.
  let followedIds = new Set();
  if (session) {
    const followResult = await query("SELECT followed_id FROM follows WHERE follower_id = $1", [
      session.id,
    ]);
    followedIds = new Set(followResult.rows.map((r) => r.followed_id));
  }

  const members = result.rows.map((m) => ({ ...m, is_following: followedIds.has(m.id) }));

  return NextResponse.json({ members });
}