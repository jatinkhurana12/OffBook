const { query } = require("../../../../lib/db");
const { getSession } = require("../../../../lib/auth");
const { sendDirectMessage } = require("../../../../lib/mailer");
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const recipientId = Number(params.id);
  if (!recipientId || recipientId === session.id) {
    return NextResponse.json({ error: "You can't message that person." }, { status: 400 });
  }

  const { message } = await request.json();
  const cleanMessage = (message || "").trim();
  if (!cleanMessage) {
    return NextResponse.json({ error: "Write something before sending." }, { status: 400 });
  }
  if (cleanMessage.length > 4000) {
    return NextResponse.json({ error: "That message is too long." }, { status: 400 });
  }

  const recipient = await query("SELECT id, name, email FROM users WHERE id = $1", [recipientId]);
  if (recipient.rows.length === 0) {
    return NextResponse.json({ error: "That person doesn't exist." }, { status: 404 });
  }

  await sendDirectMessage({
    toEmail: recipient.rows[0].email,
    toName: recipient.rows[0].name,
    fromName: session.name,
    fromEmail: session.email,
    message: cleanMessage,
  });

  return NextResponse.json({ ok: true });
}