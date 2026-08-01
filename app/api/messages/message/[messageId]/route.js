const { query } = require("../../../../../lib/db");
const { getSession } = require("../../../../../lib/auth");
const { deleteAttachment } = require("../../../../../lib/blob");
import { NextResponse } from "next/server";

// DELETE a single message — sent or received — from the logged-in user's
// own view only. Works like "delete for me": the other person in the
// conversation keeps seeing it until they delete it too. Once BOTH sides
// have deleted it, nobody can see it anymore, so we hard-delete the row and
// its attachment (if any) right away instead of waiting for the 72-hour
// cleanup job.
export async function DELETE(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const messageId = Number(params.messageId);
  if (!messageId) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const existing = await query(
    "SELECT id, sender_id, recipient_id, attachment_url, deleted_by_sender, deleted_by_recipient FROM messages WHERE id = $1",
    [messageId]
  );
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "That message is already gone." }, { status: 404 });
  }

  const msg = existing.rows[0];
  if (msg.sender_id !== session.id && msg.recipient_id !== session.id) {
    return NextResponse.json({ error: "That's not your message to delete." }, { status: 403 });
  }

  const isSender = msg.sender_id === session.id;
  const nowDeletedBySender = isSender ? true : msg.deleted_by_sender;
  const nowDeletedByRecipient = isSender ? msg.deleted_by_recipient : true;

  if (nowDeletedBySender && nowDeletedByRecipient) {
    await query("DELETE FROM messages WHERE id = $1", [messageId]);
    await deleteAttachment(msg.attachment_url);
  } else {
    const column = isSender ? "deleted_by_sender" : "deleted_by_recipient";
    await query(`UPDATE messages SET ${column} = TRUE WHERE id = $1`, [messageId]);
  }

  return NextResponse.json({ ok: true });
}