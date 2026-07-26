const { generateCaptcha } = require("../../../lib/captcha");
import { NextResponse } from "next/server";

// Without this, Next.js treats this as a static route with no inputs and
// caches a single response forever, so every visitor gets the same code.
export const dynamic = "force-dynamic";

export async function GET() {
  const { code, token } = generateCaptcha();
  return NextResponse.json({ code, token });
}