const { query } = require("../../../../lib/db");
const { getSession } = require("../../../../lib/auth");
const { sendPushToUser } = require("../../../../lib/push");
import { NextResponse } from "next/server";

// GET the full message history between the logged-in user and :id, and mark
// any messages *they* sent to us as read.
export async function GET(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const otherId = Number(params.id);
  if (!otherId) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const otherUser = await query(
    `SELECT users.id, users.name, profiles.avatar_url FROM users
     JOIN profiles ON profiles.user_id = users.id
     WHERE users.id = $1`,
    [otherId]
  );
  if (otherUser.rows.length === 0) {
    return NextResponse.json({ error: "That person doesn't exist." }, { status: 404 });
  }

  await query(
    "UPDATE messages SET read_at = NOW() WHERE recipient_id = $1 AND sender_id = $2 AND read_at IS NULL",
    [session.id, otherId]
  );

  const messages = await query(
    `SELECT id, sender_id, recipient_id, body, created_at,
            attachment_url, attachment_type, attachment_name
     FROM messages
     WHERE ((sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1))
       AND NOT (
         (sender_id = $1 AND deleted_by_sender) OR (recipient_id = $1 AND deleted_by_recipient)
       )
     ORDER BY created_at ASC`,
    [session.id, otherId]
  );

  return NextResponse.json({ otherUser: otherUser.rows[0], messages: messages.rows });
}

// DELETE the whole conversation with :id — but only from the logged-in
// user's side. Messages are marked deleted for whichever role (sender or
// recipient) the logged-in user played in each row; the other person still
// sees their copy until they delete it themselves or the 72-hour cleanup
// job removes it for everyone.
export async function DELETE(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const otherId = Number(params.id);
  if (!otherId) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await query(
    `UPDATE messages
     SET deleted_by_sender = CASE WHEN sender_id = $1 THEN TRUE ELSE deleted_by_sender END,
         deleted_by_recipient = CASE WHEN recipient_id = $1 THEN TRUE ELSE deleted_by_recipient END
     WHERE (sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1)`,
    [session.id, otherId]
  );

  return NextResponse.json({ ok: true });
}

// POST a new message to :id.
export async function POST(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const recipientId = Number(params.id);
  if (!recipientId || recipientId === session.id) {
    return NextResponse.json({ error: "You can't message that person." }, { status: 400 });
  }

  const { message, attachment } = await request.json();
  const cleanMessage = (message || "").trim();

  // A message needs either text or an attachment (or both) — but not neither.
  if (!cleanMessage && !attachment) {
    return NextResponse.json({ error: "Write something or attach a file before sending." }, { status: 400 });
  }
  if (cleanMessage.length > 4000) {
    return NextResponse.json({ error: "That message is too long." }, { status: 400 });
  }

  let attachmentUrl = null;
  let attachmentType = null;
  let attachmentName = null;
  if (attachment) {
    const { url, type, name } = attachment;
    if (!url || !["image", "audio", "video"].includes(type)) {
      return NextResponse.json({ error: "That attachment looks invalid." }, { status: 400 });
    }
    // Only ever accept blob URLs from our own storage account, never an
    // arbitrary URL the client could pass in.
    if (!url.includes(".public.blob.vercel-storage.com/")) {
      return NextResponse.json({ error: "That attachment looks invalid." }, { status: 400 });
    }
    attachmentUrl = url;
    attachmentType = type;
    attachmentName = (name || "").slice(0, 200);
  }

  const recipient = await query("SELECT id, name, email FROM users WHERE id = $1", [recipientId]);
  if (recipient.rows.length === 0) {
    return NextResponse.json({ error: "That person doesn't exist." }, { status: 404 });
  }

  // Was there already an unread message from us to them before this one?
  // If so they've already got a pending notification email — no need to
  // send another one for every message in a back-and-forth chat.
  const priorUnread = await query(
    "SELECT 1 FROM messages WHERE sender_id = $1 AND recipient_id = $2 AND read_at IS NULL LIMIT 1",
    [session.id, recipientId]
  );

  const inserted = await query(
    `INSERT INTO messages (sender_id, recipient_id, body, attachment_url, attachment_type, attachment_name)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, sender_id, recipient_id, body, created_at,
               attachment_url, attachment_type, attachment_name`,
    [session.id, recipientId, cleanMessage, attachmentUrl, attachmentType, attachmentName]
  );

 if (priorUnread.rows.length === 0) {
    // Best-effort — a failed push notification shouldn't fail the send.
    // No email involved: this goes straight to the browser via Web Push.
    const pushBody = cleanMessage
      ? (cleanMessage.length > 120 ? `${cleanMessage.slice(0, 117)}...` : cleanMessage)
      : attachmentType
      ? `Sent a${attachmentType === "image" ? "n" : ""} ${attachmentType}`
      : "";
    sendPushToUser(recipientId, {
      title: `${session.name} sent you a message`,
      body: pushBody,
      url: "/messages",
    }).catch((err) => console.error("[messages] push notification failed:", err));
  }

  return NextResponse.json({ message: inserted.rows[0] });
}