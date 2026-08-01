const { getSession } = require("../../../../../lib/auth");
const { query } = require("../../../../../lib/db");
const { uploadChunkToYoutube, queryUploadOffset } = require("../../../../../lib/youtube");
import { NextResponse } from "next/server";

// Give this a bit of headroom for slower relay round-trips to YouTube —
// well under any duration limit, since chunks are only a few MB each.
export const maxDuration = 30;

// Relays one chunk of a video upload to YouTube's resumable session URI.
// The browser never talks to googleapis.com directly — see lib/youtube.js
// for why (YouTube's upload endpoint doesn't return browser-readable CORS
// headers, so direct browser uploads succeed on YouTube's side but the
// browser can't read the confirmation and reports a false failure).
// Each chunk stays well under Vercel's 4.5MB request-body limit.
export async function POST(request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const profileResult = await query("SELECT is_trailblazer FROM profiles WHERE user_id = $1", [
    session.id,
  ]);
  if (!profileResult.rows[0]?.is_trailblazer) {
    return NextResponse.json({ error: "Only trailblazers can post video lectures." }, { status: 403 });
  }

  const uploadUrl = request.headers.get("x-upload-url");
  const start = Number(request.headers.get("x-chunk-start"));
  const total = Number(request.headers.get("x-file-total"));
  const mimeType = request.headers.get("x-mime-type") || "application/octet-stream";
  const queryOnly = request.headers.get("x-query-only") === "true";

  if (!uploadUrl || Number.isNaN(total)) {
    return NextResponse.json({ error: "Missing upload metadata." }, { status: 400 });
  }

  // Only ever relay to Google's own upload host — never let this become
  // an open proxy to an arbitrary URL.
  let parsed;
  try {
    parsed = new URL(uploadUrl);
  } catch {
    return NextResponse.json({ error: "Invalid upload URL." }, { status: 400 });
  }
  if (parsed.hostname !== "www.googleapis.com") {
    return NextResponse.json({ error: "Invalid upload destination." }, { status: 400 });
  }

  try {
    if (queryOnly) {
      const offset = await queryUploadOffset({ uploadUrl, total });
      return NextResponse.json({ done: false, nextOffset: offset });
    }

    if (Number.isNaN(start)) {
      return NextResponse.json({ error: "Missing chunk start offset." }, { status: 400 });
    }

    const chunk = Buffer.from(await request.arrayBuffer());
    const end = start + chunk.byteLength;

    const result = await uploadChunkToYoutube({ uploadUrl, chunk, start, end, total, mimeType });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[trailblazers/lectures/upload-chunk]", err);
    return NextResponse.json({ error: err.message || "Chunk upload failed." }, { status: 502 });
  }
}