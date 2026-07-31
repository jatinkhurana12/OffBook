const { query } = require("../../../lib/db");
const { sendContactMessageEmail } = require("../../../lib/mailer");
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const { name, email, phone, message } = await request.json();

  const cleanName = (name || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPhone = (phone || "").trim();
  const cleanMessage = (message || "").trim();

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (cleanName.length > 120 || cleanEmail.length > 200 || cleanPhone.length > 30) {
    return NextResponse.json({ error: "One of the fields is too long." }, { status: 400 });
  }
  if (cleanMessage.length > 4000) {
    return NextResponse.json({ error: "Message is too long (max 4000 characters)." }, { status: 400 });
  }

  await query(
    "INSERT INTO contact_messages (name, email, phone, message) VALUES ($1, $2, $3, $4)",
    [cleanName, cleanEmail, cleanPhone, cleanMessage]
  );

  try {
    await sendContactMessageEmail({ name: cleanName, email: cleanEmail, phone: cleanPhone, message: cleanMessage });
  } catch (err) {
    // The message is already saved in the DB, so don't fail the request just
    // because the notification email had trouble — just log it.
    console.error("[contact] failed to send notification email:", err);
  }

  return NextResponse.json({ ok: true });
}