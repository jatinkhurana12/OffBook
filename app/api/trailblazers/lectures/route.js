const { getSession } = require("../../../../lib/auth");
const { query } = require("../../../../lib/db");
import { NextResponse } from "next/server";

// GET /api/trailblazers/lectures                    -> everyone's lectures, newest first
// GET /api/trailblazers/lectures?trailblazer_id=123  -> just one trailblazer's lectures
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const trailblazerId = searchParams.get("trailblazer_id");

  const params = [];
  let where = "";
  if (trailblazerId) {
    params.push(Number(trailblazerId));
    where = `WHERE lectures.user_id = $${params.length}`;
  }

  const result = await query(
    `SELECT lectures.id, lectures.user_id, lectures.type, lectures.title, lectures.description,
            lectures.body, lectures.youtube_video_id, lectures.created_at,
            users.name AS author_name, profiles.avatar_url AS author_avatar
     FROM lectures
     JOIN users ON users.id = lectures.user_id
     JOIN profiles ON profiles.user_id = users.id
     ${where}
     ORDER BY lectures.created_at DESC
     LIMIT 100`,
    params
  );

  return NextResponse.json({ lectures: result.rows });
}

// POST creates a lecture. type: "article" (needs body) or "video" (needs
// youtube_video_id, obtained beforehand via /upload-url + a direct
// browser upload to YouTube — see components/VideoUploadForm.js).
export async function POST(request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const profileResult = await query("SELECT is_trailblazer FROM profiles WHERE user_id = $1", [
    session.id,
  ]);
  if (!profileResult.rows[0]?.is_trailblazer) {
    return NextResponse.json({ error: "Only trailblazers can post lectures." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.type || !body?.title?.trim()) {
    return NextResponse.json({ error: "Missing type or title." }, { status: 400 });
  }

  const title = body.title.trim().slice(0, 200);
  const description = (body.description || "").trim().slice(0, 500);

  if (body.type === "article") {
    if (!body.body || !body.body.trim()) {
      return NextResponse.json({ error: "An article needs some content." }, { status: 400 });
    }
    const result = await query(
      `INSERT INTO lectures (user_id, type, title, description, body)
       VALUES ($1, 'article', $2, $3, $4) RETURNING id`,
      [session.id, title, description, body.body]
    );
    return NextResponse.json({ id: result.rows[0].id });
  }

  if (body.type === "video") {
    if (!body.youtube_video_id) {
      return NextResponse.json(
        { error: "Missing youtube_video_id — upload the video first via /upload-url." },
        { status: 400 }
      );
    }
    const result = await query(
      `INSERT INTO lectures (user_id, type, title, description, youtube_video_id)
       VALUES ($1, 'video', $2, $3, $4) RETURNING id`,
      [session.id, title, description, body.youtube_video_id]
    );
    return NextResponse.json({ id: result.rows[0].id });
  }

  return NextResponse.json({ error: "Unknown lecture type." }, { status: 400 });
}