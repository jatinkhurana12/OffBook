const { query } = require("../../../../lib/db");
const { getSession, isAdmin } = require("../../../../lib/auth");
const { createResetToken, buildResetUrl } = require("../../../../lib/passwordReset");
import { NextResponse } from "next/server";

export async function POST(request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const userResult = await query("SELECT id, name, email FROM users WHERE id = $1", [userId]);
  const user = userResult.rows[0];
  if (!user) {
    return NextResponse.json({ error: "No user with that id." }, { status: 404 });
  }

  const { rawToken, expiresAt } = await createResetToken(user.id);
  const origin = process.env.APP_URL || new URL(request.url).origin;
  const resetUrl = buildResetUrl(origin, rawToken);

  // Lightweight audit trail — who generated a reset link, for whom, when.
  // Goes to your server/Vercel logs, not stored in the DB.
  console.log(`[admin] ${session.email} generated a reset link for user #${user.id} (${user.email})`);

  return NextResponse.json({ ok: true, resetUrl, expiresAt, user: { id: user.id, name: user.name, email: user.email } });
}