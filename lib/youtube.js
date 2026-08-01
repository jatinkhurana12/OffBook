// Talks to the YouTube Data API v3 using OAuth credentials for OffBook's
// own YouTube channel — NOT the trailblazer's. Every trailblazer's video
// lands on this one shared channel, posted as "Unlisted": not searchable
// and not shown on the channel, but playable anywhere it's embedded,
// which is exactly what the OffBook player needs.
//
// One-time setup to get YOUTUBE_REFRESH_TOKEN: see
// scripts/get-youtube-refresh-token.js.
//
// Required env vars:
//   YOUTUBE_CLIENT_ID
//   YOUTUBE_CLIENT_SECRET
//   YOUTUBE_REFRESH_TOKEN

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const UPLOAD_URL =
  "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status";

function assertConfigured() {
  const missing = ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REFRESH_TOKEN"].filter(
    (key) => !process.env[key]
  );
  if (missing.length) {
    throw new Error(
      `YouTube isn't configured yet — missing env var(s): ${missing.join(", ")}. ` +
        "See scripts/get-youtube-refresh-token.js."
    );
  }
}

// Exchanges the long-lived refresh token for a short-lived access token.
// Access tokens expire in ~1hr, so we just fetch a fresh one on every
// request rather than trying to cache one across serverless invocations.
async function getAccessToken() {
  assertConfigured();

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Couldn't get a YouTube access token: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

// Starts a resumable upload session and returns the session URL. The
// browser PUTs the actual video bytes straight to that URL — the file
// never passes through our server, so it isn't subject to Vercel's
// serverless request-body size limit (~4.5MB, nowhere near enough for a
// video). The session URL itself is a capability token good for ~7 days,
// so nothing else needs to be shared with the client.
async function createResumableUploadSession({ title, description, fileSizeBytes, mimeType }) {
  const accessToken = await getAccessToken();

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": String(fileSizeBytes),
      "X-Upload-Content-Type": mimeType,
    },
    body: JSON.stringify({
      snippet: {
        title: (title || "Untitled lecture").slice(0, 100),
        description: description || "",
      },
      status: {
        privacyStatus: "unlisted",
        selfDeclaredMadeForKids: false,
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`YouTube rejected the upload session: ${res.status} ${errBody}`);
  }

  const uploadUrl = res.headers.get("location");
  if (!uploadUrl) {
    throw new Error("YouTube didn't return an upload session URL.");
  }
  return uploadUrl;
}

// Deletes a video from YouTube — used when a trailblazer deletes a
// lecture, so unlisted uploads don't quietly pile up on the channel
// forever. 404s (already gone) are treated as success.
async function deleteVideo(videoId) {
  const accessToken = await getAccessToken();
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(videoId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok && res.status !== 404) {
    const errBody = await res.text();
    throw new Error(`YouTube rejected the delete: ${res.status} ${errBody}`);
  }
}

module.exports = { createResumableUploadSession, deleteVideo };