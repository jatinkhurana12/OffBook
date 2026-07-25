const { query } = require("../../../lib/db");
const { getSession } = require("../../../lib/auth");
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  let sql = `
    SELECT problems.*, users.name AS author_name,
      (SELECT COUNT(*) FROM comments WHERE comments.problem_id = problems.id) AS comment_count
    FROM problems JOIN users ON users.id = problems.user_id
  `;
  const args = [];
  if (domain && domain !== "all") {
    sql += " WHERE problems.domain = $1";
    args.push(domain);
  }
  sql += " ORDER BY problems.created_at DESC";

  const result = await query(sql, args);
  return NextResponse.json({ problems: result.rows });
}

export async function POST(request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const { title, domain, severity, description, seeking } = await request.json();
  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO problems (user_id, title, domain, severity, description, seeking)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [session.id, title.trim(), domain || "other", severity || "annoying", description.trim(), seeking || ""]
  );

  return NextResponse.json({ ok: true, id: result.rows[0].id });
}
