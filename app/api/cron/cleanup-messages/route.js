const { query } = require("../../../../lib/db");
const { deleteAttachment } = require("../../../../lib/blob");
import { NextResponse } from "next/server";

// Deletes every message (sent or received, read or not) older than 72 hours.
// This is a hard delete — the whole point is to keep the messages table
// small so it isn't carrying data the app has no ongoing use for.
//
// Triggered on a schedule by Vercel Cron (see vercel.json). Vercel signs
// cron requests with an "Authorization: Bearer $CRON_SECRET" header
// automatically as long as CRON_SECRET is set in the project's env vars,
// so this route just has to check for that same secret.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    console.error("[cleanup-messages] CRON_SECRET is not set — refusing to run.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Grab attachment URLs first so we can clean up the blob store too —
  // otherwise old media just sits there forever after its message is gone.
  const expiring = await query(
    "SELECT id, attachment_url FROM messages WHERE created_at < NOW() - INTERVAL '72 hours' AND attachment_url IS NOT NULL"
  );
  await Promise.all(expiring.rows.map((row) => deleteAttachment(row.attachment_url)));

  const result = await query(
    "DELETE FROM messages WHERE created_at < NOW() - INTERVAL '72 hours' RETURNING id"
  );

  console.log(
    `[cleanup-messages] Deleted ${result.rowCount} message(s) older than 72 hours (${expiring.rows.length} with attachments).`
  );
  return NextResponse.json({ deleted: result.rowCount, attachmentsDeleted: expiring.rows.length });
}