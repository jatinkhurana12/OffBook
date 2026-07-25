const { clearSessionCookie } = require("../../../../lib/auth");
import { NextResponse } from "next/server";

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
