const { query } = require("../../../../lib/db");
const { getSession } = require("../../../../lib/auth");
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const followedId = Number(params.id);
  if (!followedId || followedId === session.id) {
    return NextResponse.json({ error: "You can't follow that person." }, { status: 400 });
  }

  const target = await query("SELECT id FROM users WHERE id = $1", [followedId]);
  if (target.rows.length === 0) {
    return NextResponse.json({ error: "That person doesn't exist." }, { status: 404 });
  }

  await query(
    `INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)
     ON CONFLICT (follower_id, followed_id) DO NOTHING`,
    [session.id, followedId]
  );

  return NextResponse.json({ ok: true, following: true });
}

export async function DELETE(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const followedId = Number(params.id);

  await query("DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2", [
    session.id,
    followedId,
  ]);

  return NextResponse.json({ ok: true, following: false });
}