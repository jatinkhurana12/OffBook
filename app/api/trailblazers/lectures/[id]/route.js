const { getSession } = require("../../../../../lib/auth");
const { query } = require("../../../../../lib/db");
const { deleteVideo } = require("../../../../../lib/youtube");
import { NextResponse } from "next/server";

async function loadOwnedLecture(lectureId, userId) {
  const result = await query("SELECT * FROM lectures WHERE id = $1", [lectureId]);
  const lecture = result.rows[0];
  if (!lecture) {
    return { error: NextResponse.json({ error: "That lecture doesn't exist." }, { status: 404 }) };
  }
  if (lecture.user_id !== userId) {
    return {
      error: NextResponse.json({ error: "You can only manage your own lectures." }, { status: 403 }),
    };
  }
  return { lecture };
}

// PATCH edits title/description (and body, for articles). The video file
// itself can't be swapped this way — YouTube's own copy of title/
// description is left untouched too, since the player never reads it;
// only this DB row is shown on OffBook.
export async function PATCH(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const lectureId = Number(params.id);
  if (!lectureId) return NextResponse.json({ error: "That lecture doesn't exist." }, { status: 404 });

  const { lecture, error } = await loadOwnedLecture(lectureId, session.id);
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "Title can't be empty." }, { status: 400 });
  }

  const title = body.title.trim().slice(0, 200);
  const description = (body.description || "").trim().slice(0, 500);

  if (lecture.type === "article") {
    if (!body.body || !body.body.trim()) {
      return NextResponse.json({ error: "An article needs some content." }, { status: 400 });
    }
    await query("UPDATE lectures SET title = $1, description = $2, body = $3 WHERE id = $4", [
      title,
      description,
      body.body,
      lectureId,
    ]);
  } else {
    await query("UPDATE lectures SET title = $1, description = $2 WHERE id = $3", [
      title,
      description,
      lectureId,
    ]);
  }

  return NextResponse.json({ ok: true });
}

// DELETE removes the lecture row, and — for videos — best-effort deletes
// the underlying YouTube upload too, so the shared channel doesn't
// accumulate unlisted videos nobody can see anymore.
export async function DELETE(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const lectureId = Number(params.id);
  if (!lectureId) return NextResponse.json({ error: "That lecture doesn't exist." }, { status: 404 });

  const { lecture, error } = await loadOwnedLecture(lectureId, session.id);
  if (error) return error;

  await query("DELETE FROM lectures WHERE id = $1", [lectureId]);

  if (lecture.type === "video" && lecture.youtube_video_id) {
    deleteVideo(lecture.youtube_video_id).catch((err) =>
      console.error("[trailblazers/lectures DELETE] YouTube cleanup failed:", err)
    );
  }

  return NextResponse.json({ ok: true });
}