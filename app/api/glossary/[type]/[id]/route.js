const { query } = require("../../../../../lib/db");
const { getSession } = require("../../../../../lib/auth");
import { NextResponse } from "next/server";

const VALID_TYPES = ["lecture", "problem", "internship"];

// GET /api/glossary/:type/:id -> { glossed: boolean }
// Used by GlossaryButton to know which mark to show on load.
export async function GET(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ glossed: false });

  const { type, id } = params;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Unknown item type." }, { status: 400 });
  }

  const result = await query(
    "SELECT id FROM glossary_items WHERE user_id = $1 AND item_type = $2 AND item_id = $3",
    [session.id, type, Number(id)]
  );
  return NextResponse.json({ glossed: result.rows.length > 0 });
}

// POST /api/glossary/:type/:id -> marks the item for the current user
export async function POST(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const { type, id } = params;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Unknown item type." }, { status: 400 });
  }
  const itemId = Number(id);
  if (!itemId) return NextResponse.json({ error: "Invalid item." }, { status: 400 });

  await query(
    `INSERT INTO glossary_items (user_id, item_type, item_id) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, item_type, item_id) DO NOTHING`,
    [session.id, type, itemId]
  );

  return NextResponse.json({ ok: true, glossed: true });
}

// DELETE /api/glossary/:type/:id -> unmarks the item for the current user
export async function DELETE(request, { params }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  const { type, id } = params;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Unknown item type." }, { status: 400 });
  }

  await query(
    "DELETE FROM glossary_items WHERE user_id = $1 AND item_type = $2 AND item_id = $3",
    [session.id, type, Number(id)]
  );

  return NextResponse.json({ ok: true, glossed: false });
}