// Stores shared message attachments (images, audio, video) in Vercel Blob.
//
// Setup (2 minutes):
//   1. npm install (pulls in the "@vercel/blob" package now listed in package.json)
//   2. In the Vercel dashboard: Project -> Storage -> Create Database -> Blob.
//      Connect it to this project. Vercel then auto-injects BLOB_READ_WRITE_TOKEN
//      into your deployment's environment — no manual copy/paste needed in prod.
//   3. For local dev, pull that token down so `npm run dev` can upload too:
//        vercel env pull .env.local
//      (or copy BLOB_READ_WRITE_TOKEN from Vercel -> Settings -> Environment
//      Variables into .env.local by hand)
//
// If BLOB_READ_WRITE_TOKEN isn't set, uploads will fail with a clear error
// instead of a confusing one — see the check in the upload route.

const { put, del } = require("@vercel/blob");

const ALLOWED_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"],
  audio: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/ogg", "audio/x-m4a", "audio/aac"],
  video: ["video/mp4", "video/webm", "video/quicktime", "video/ogg"],
};

// Images stay small since they render inline everywhere; audio/video get
// more headroom since a short voice memo or clip is easily a few MB.
const MAX_BYTES = {
  image: 8 * 1024 * 1024, // 8MB
  audio: 25 * 1024 * 1024, // 25MB
  video: 50 * 1024 * 1024, // 50MB
};

function attachmentKindFor(mimeType) {
  for (const [kind, mimes] of Object.entries(ALLOWED_TYPES)) {
    if (mimes.includes(mimeType)) return kind;
  }
  return null;
}

async function uploadAttachment(file, userId) {
  const kind = attachmentKindFor(file.type);
  if (!kind) {
    throw new Error("That file type isn't supported. Please share an image, audio, or video file.");
  }
  if (file.size > MAX_BYTES[kind]) {
    const limitMb = MAX_BYTES[kind] / (1024 * 1024);
    throw new Error(`That file is too large. ${kind} attachments are limited to ${limitMb}MB.`);
  }

  const safeName = (file.name || kind).replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const pathname = `messages/${userId}/${Date.now()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return { url: blob.url, type: kind, name: file.name || safeName };
}

// Best-effort delete — called from the message-cleanup cron and from
// single-message deletes so old media doesn't pile up in the blob store
// after the message pointing to it is gone.
async function deleteAttachment(url) {
  if (!url) return;
  try {
    await del(url);
  } catch (err) {
    console.error("[blob] failed to delete attachment:", err);
  }
}

module.exports = { uploadAttachment, deleteAttachment };