const { query } = require("../../../../lib/db");
const { getSession, isAdmin } = require("../../../../lib/auth");
import { NextResponse } from "next/server";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  // Deliberately never selects password_hash — admins can see who signed up,
  // not their credentials. Password hashes should never leave the DB.
  const result = await query(
    "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC"
  );

  return NextResponse.json({ users: result.rows });
}