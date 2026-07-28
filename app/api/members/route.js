const { query } = require("../../../lib/db");
import { NextResponse } from "next/server";

export async function GET(request) {
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
  return NextResponse.json({ members: result.rows });
}
