const { getSession } = require("../../../../../lib/auth");
const { query } = require("../../../../../lib/db");
const { createResumableUploadSession } = require("../../../../../lib/youtube");
import { NextResponse } from "next/server";

// YouTube itself allows much larger files; this just guards against
// obviously-wrong uploads before we bother asking YouTube for a session.
const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024; // 2GB

export async function POST(request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const profileResult = await query("SELECT is_trailblazer FROM profiles WHERE user_id = $1", [
    session.id,
  ]);
  if (!profileResult.rows[0]?.is_trailblazer) {
    return NextResponse.json({ error: "Only trailblazers can post video lectures." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.fileSizeBytes || !body?.mimeType) {
    return NextResponse.json(
      { error: "Missing title, fileSizeBytes, or mimeType." },
      { status: 400 }
    );
  }
  if (!body.mimeType.startsWith("video/")) {
    return NextResponse.json({ error: "That doesn't look like a video file." }, { status: 400 });
  }
  if (body.fileSizeBytes > MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: "That file is too large." }, { status: 400 });
  }

  try {
    const uploadUrl = await createResumableUploadSession({
      title: body.title,
      description: body.description || "",
      fileSizeBytes: body.fileSizeBytes,
      mimeType: body.mimeType,
    });
    return NextResponse.json({ uploadUrl });
  } catch (err) {
    console.error("[trailblazers/lectures/upload-url]", err);
    return NextResponse.json({ error: err.message || "Couldn't start the upload." }, { status: 500 });
  }
}