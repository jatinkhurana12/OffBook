const { getSession } = require("../../../../lib/auth");
const { uploadAttachment } = require("../../../../lib/blob");
import { NextResponse } from "next/server";

// Uploads a single image/audio/video file to Vercel Blob and hands back the
// public URL. The message itself isn't created here — the client uploads
// the file first, then POSTs to /api/messages/[id] with the returned URL
// attached, same as it already does for plain text messages.
export async function POST(request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "You need to log in first." }, { status: 401 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("[messages/upload] BLOB_READ_WRITE_TOKEN is not set — see lib/blob.js for setup.");
    return NextResponse.json(
      { error: "File sharing isn't configured on the server yet." },
      { status: 500 }
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Couldn't read that upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file was attached." }, { status: 400 });
  }

  try {
    const attachment = await uploadAttachment(file, session.id);
    return NextResponse.json({ attachment });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Upload failed. Try again." }, { status: 400 });
  }
}