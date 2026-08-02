const { query } = require("../../../lib/db");
const { getSession } = require("../../../lib/auth");
import { NextResponse } from "next/server";

// GET /api/glossary -> everything the current user has marked, grouped by
// type and joined against the source tables so the Glossary page has
// titles/authors to show without extra round trips.
export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const items = await query(
    `SELECT item_type, item_id, created_at
     FROM glossary_items
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [session.id]
  );

  const idsFor = (type) => items.rows.filter((r) => r.item_type === type).map((r) => r.item_id);
  const lectureIds = idsFor("lecture");
  const problemIds = idsFor("problem");
  const internshipIds = idsFor("internship");

  const [lectures, problems, internships] = await Promise.all([
    lectureIds.length
      ? query(
          `SELECT lectures.id, lectures.type, lectures.title, lectures.description,
                  lectures.youtube_video_id, lectures.user_id, users.name AS author_name
           FROM lectures JOIN users ON users.id = lectures.user_id
           WHERE lectures.id = ANY($1::int[])`,
          [lectureIds]
        )
      : { rows: [] },
    problemIds.length
      ? query(
          `SELECT problems.id, problems.title, problems.domain, problems.severity,
                  problems.user_id, users.name AS author_name
           FROM problems JOIN users ON users.id = problems.user_id
           WHERE problems.id = ANY($1::int[])`,
          [problemIds]
        )
      : { rows: [] },
    internshipIds.length
      ? query(
          `SELECT internships.id, internships.role_title, internships.organization,
                  internships.paid, internships.user_id, users.name AS poster_name
           FROM internships JOIN users ON users.id = internships.user_id
           WHERE internships.id = ANY($1::int[])`,
          [internshipIds]
        )
      : { rows: [] },
  ]);

  // Glossary rows are the source of truth for ordering (most recently
  // marked first) and survive even if the underlying item was deleted —
  // rows the join couldn't find are just dropped here.
  const addedAt = {};
  items.rows.forEach((r) => {
    addedAt[`${r.item_type}:${r.item_id}`] = r.created_at;
  });
  const sorted = (rows, type) =>
    rows
      .map((r) => ({ ...r, glossary_added_at: addedAt[`${type}:${r.id}`] }))
      .sort((a, b) => new Date(b.glossary_added_at) - new Date(a.glossary_added_at));

  return NextResponse.json({
    lectures: sorted(lectures.rows, "lecture"),
    problems: sorted(problems.rows, "problem"),
    internships: sorted(internships.rows, "internship"),
  });
}