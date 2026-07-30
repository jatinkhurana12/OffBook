const { query } = require("../../../../../lib/db");
const { getSession } = require("../../../../../lib/auth");
import { NextResponse } from "next/server";

// DELETE a single message — sent or received — from the logged-in user's
// own view only. Works like "delete for me": the other person in the
// conversation keeps seeing it until they delete it too, or until the
// 72-hour cleanup job removes it for everyone.
export async function DELETE(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const messageId = Number(params.messageId);
  if (!messageId) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const existing = await query(
    "SELECT id, sender_id, recipient_id FROM messages WHERE id = $1",
    [messageId]
  );
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "That message is already gone." }, { status: 404 });
  }

  const msg = existing.rows[0];
  if (msg.sender_id !== session.id && msg.recipient_id !== session.id) {
    return NextResponse.json({ error: "That's not your message to delete." }, { status: 403 });
  }

  const column = msg.sender_id === session.id ? "deleted_by_sender" : "deleted_by_recipient";
  await query(`UPDATE messages SET ${column} = TRUE WHERE id = $1`, [messageId]);

  return NextResponse.json({ ok: true });
}