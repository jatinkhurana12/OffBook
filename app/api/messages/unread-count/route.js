const { query } = require("../../../../lib/db");
const { getSession } = require("../../../../lib/auth");
import { NextResponse } from "next/server";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ count: 0 });

  const result = await query(
    "SELECT COUNT(*)::int AS count FROM messages WHERE recipient_id = $1 AND read_at IS NULL",
    [session.id]
  );

  return NextResponse.json({ count: result.rows[0].count });
}