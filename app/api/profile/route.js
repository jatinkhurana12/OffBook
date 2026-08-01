const { query } = require("../../../lib/db");
const { getSession, clearSessionCookie, createSessionCookie } = require("../../../lib/auth");
const { deleteVideo } = require("../../../lib/youtube");
const { deleteAttachment } = require("../../../lib/blob");
import { NextResponse } from "next/server";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const result = await query(
    `SELECT users.id, users.name, users.email, profiles.* FROM users
     JOIN profiles ON profiles.user_id = users.id
     WHERE users.id = $1`,
    [session.id]
  );

  return NextResponse.json({ profile: result.rows[0] });
}

export async function PUT(request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const {
    name,
    headline,
    bio,
    left_because,
    skills,
    looking_for,
    availability,
    links,
    shipped,
    avatar_url,
    is_trailblazer,
    niche,
  } = await request.json();

  // avatar_url is a data: URL (base64) capped client-side at 2MB; guard
  // server-side too so no one can bypass the client check.
  if (avatar_url && avatar_url.length > 2_800_000) {
    return NextResponse.json({ error: "Image is too large. Please use a smaller picture." }, { status: 400 });
  }

  const cleanName = (name || "").trim();
if (!cleanName) {
  return NextResponse.json({ error: "Name can't be empty." }, { status: 400 });
}
if (cleanName.length > 80) {
  return NextResponse.json({ error: "Name is too long. Please use 80 characters or fewer." }, { status: 400 });
}

await query("UPDATE users SET name = $1 WHERE id = $2", [cleanName, session.id]);

  const cleanNiche = (niche || "").trim().slice(0, 120);

  await query(
    `UPDATE profiles SET headline = $1, bio = $2, left_because = $3, skills = $4,
       looking_for = $5, availability = $6, links = $7, shipped = $8, avatar_url = $9,
       is_trailblazer = $10, niche = $11
     WHERE user_id = $12`,
    [
      headline || "",
      bio || "",
      left_because || "",
      skills || "",
      looking_for || "",
      availability || "exploring",
      links || "",
      shipped || "",
      avatar_url || "",
      !!is_trailblazer,
      cleanNiche,
      session.id,
    ]
  );

createSessionCookie({ id: session.id, name: cleanName, email: session.email });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  // Gather everything this account has stored OUTSIDE the database — YouTube
  // videos and Blob attachments — before the cascading delete below removes
  // the rows that point to them. Once those rows are gone we'd have no way
  // to find these files again.
  const ownedVideos = await query(
    "SELECT youtube_video_id FROM lectures WHERE user_id = $1 AND type = 'video' AND youtube_video_id IS NOT NULL",
    [session.id]
  );
  const ownedAttachments = await query(
    `SELECT DISTINCT attachment_url FROM messages
     WHERE (sender_id = $1 OR recipient_id = $1) AND attachment_url IS NOT NULL`,
    [session.id]
  );

  // ON DELETE CASCADE on profiles/problems/comments/internships/problem_votes/
  // lectures/messages/follows/push_subscriptions means this one query cleans
  // up everything tied to the account in the database.
  await query("DELETE FROM users WHERE id = $1", [session.id]);

  clearSessionCookie();

  // Best-effort cleanup of external storage now that the DB rows referencing
  // them are gone. Failures are logged, not thrown — account deletion has
  // already succeeded from the user's point of view either way.
  await Promise.all([
    ...ownedVideos.rows.map((row) =>
      deleteVideo(row.youtube_video_id).catch((err) =>
        console.error("[profile DELETE] YouTube cleanup failed:", err)
      )
    ),
    ...ownedAttachments.rows.map((row) => deleteAttachment(row.attachment_url)),
  ]);

  return NextResponse.json({ ok: true });
}