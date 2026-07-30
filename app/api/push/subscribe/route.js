const { query } = require("../../../../lib/db");
const { getSession } = require("../../../../lib/auth");
import { NextResponse } from "next/server";

// Saves (or updates) the current browser's push subscription for the
// logged-in user. Called once, right after they grant notification
// permission in the browser.
export async function POST(request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const { endpoint, keys } = await request.json();
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
  }

  await query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE SET user_id = $1, p256dh = $3, auth = $4`,
    [session.id, endpoint, keys.p256dh, keys.auth]
  );

  return NextResponse.json({ ok: true });
}

// Removes a subscription — called when the user turns notifications off.
export async function DELETE(request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const { endpoint } = await request.json();
  if (!endpoint) return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });

  await query("DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2", [
    endpoint,
    session.id,
  ]);

  return NextResponse.json({ ok: true });
}