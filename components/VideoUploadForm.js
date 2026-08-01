"use client";

import { useState } from "react";

// Uploads a video in small chunks, relayed through our own server to
// YouTube — NOT a direct browser-to-YouTube PUT. That's a deliberate
// change: YouTube's upload endpoint doesn't return CORS headers a
// browser is allowed to read, so a direct browser upload actually
// succeeds on YouTube's side (the video lands on the channel) while the
// browser still reports a failed connection, since it's blocked from
// reading the confirmation back. Routing through our own same-origin API
// sidesteps CORS entirely — see app/api/trailblazers/lectures/upload-chunk
// and lib/youtube.js for the server side of this.
//
// Chunking (rather than one giant request) also means a single hiccup
// only costs one small chunk, not the whole upload, and keeps every
// individual request comfortably under Vercel's 4.5MB body limit.
export default function VideoUploadForm({ onPosted }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | uploading | processing
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Choose a video file first.");
      return;
    }
    if (!title.trim()) {
      setError("Give it a title.");
      return;
    }

    try {
      setStatus("uploading");
      setProgress(0);

      const initRes = await fetch("/api/trailblazers/lectures/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fileSizeBytes: file.size,
          mimeType: file.type,
        }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || "Couldn't start the upload.");

      const videoId = await uploadInChunks(initData.uploadUrl, file, setProgress);

      setStatus("processing");
      const postRes = await fetch("/api/trailblazers/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video",
          title,
          description,
          youtube_video_id: videoId,
        }),
      });
      const postData = await postRes.json();
      if (!postRes.ok) throw new Error(postData.error || "Uploaded, but couldn't save the post.");

      setStatus("idle");
      setTitle("");
      setDescription("");
      setFile(null);
      setProgress(0);
      if (onPosted) onPosted();
    } catch (err) {
      setStatus("idle");
      setError(err.message || "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-display text-xs uppercase tracking-wide block mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-2 border-ink bg-paper px-3 py-2 text-sm"
          placeholder="e.g. Debugging React re-renders"
        />
      </div>

      <div>
        <label className="font-display text-xs uppercase tracking-wide block mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border-2 border-ink bg-paper px-3 py-2 text-sm"
          placeholder="What will people learn?"
        />
      </div>

      <div>
        <label className="font-display text-xs uppercase tracking-wide block mb-1">
          Video file
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm"
        />
      </div>

      {status === "uploading" && (
        <div className="w-full h-2 border border-ink bg-paper">
          <div className="h-full bg-pen transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {status === "processing" && <p className="text-xs text-muted">Finishing up on YouTube...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status !== "idle"}
        className="font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink bg-ink text-paper hover:bg-pen disabled:opacity-50"
      >
        {status === "uploading"
          ? `Uploading ${progress}%`
          : status === "processing"
          ? "Saving..."
          : "Post video"}
      </button>
    </form>
  );
}

// 4MB per chunk: a multiple of the 256KB YouTube's resumable protocol
// requires, and comfortably under Vercel's 4.5MB per-request body limit
// once relayed through our own /upload-chunk route.
const CHUNK_SIZE = 4 * 1024 * 1024;
const MAX_RETRIES_PER_CHUNK = 5;

async function uploadInChunks(uploadUrl, file, setProgress) {
  const total = file.size;
  let offset = 0;
  let attempt = 0;

  while (offset < total) {
    const end = Math.min(offset + CHUNK_SIZE, total);
    const chunk = file.slice(offset, end);

    try {
      const result = await sendChunk(uploadUrl, chunk, offset, total, file.type);
      attempt = 0; // a clean chunk resets the backoff counter

      if (result.done) {
        setProgress(100);
        return result.videoId;
      }
      offset = result.nextOffset;
      setProgress(Math.round((offset / total) * 100));
    } catch (err) {
      attempt++;
      if (attempt > MAX_RETRIES_PER_CHUNK) {
        throw new Error(
          `Upload kept failing around ${Math.round((offset / total) * 100)}%. ${err.message || ""}`
        );
      }
      // Ask our server to check how much YouTube actually has before
      // retrying — a "failed" chunk sometimes partially landed.
      try {
        offset = await queryOffset(uploadUrl, total);
        setProgress(Math.round((offset / total) * 100));
      } catch {
        // Couldn't even check — just retry from the same offset.
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt)); // simple backoff
    }
  }

  throw new Error("Upload finished sending bytes but YouTube never confirmed completion.");
}

// Sends one chunk to OUR server (same-origin — no CORS involved at all),
// which then relays it to YouTube server-side.
function sendChunk(uploadUrl, chunk, start, total, mimeType) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/trailblazers/lectures/upload-chunk", true);
    xhr.setRequestHeader("X-Upload-Url", uploadUrl);
    xhr.setRequestHeader("X-Chunk-Start", String(start));
    xhr.setRequestHeader("X-File-Total", String(total));
    xhr.setRequestHeader("X-Mime-Type", mimeType);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");

    xhr.onload = () => {
      let data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Unexpected response while uploading this chunk."));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data.error || `Upload chunk failed (status ${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error reaching OffBook's server."));
    xhr.send(chunk);
  });
}

// Asks our server to check YouTube's actual received-bytes count.
function queryOffset(uploadUrl, total) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/trailblazers/lectures/upload-chunk", true);
    xhr.setRequestHeader("X-Upload-Url", uploadUrl);
    xhr.setRequestHeader("X-File-Total", String(total));
    xhr.setRequestHeader("X-Query-Only", "true");

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data.nextOffset);
        } else {
          reject(new Error(data.error || "Couldn't check upload status."));
        }
      } catch {
        reject(new Error("Couldn't check upload status."));
      }
    };
    xhr.onerror = () => reject(new Error("Network error checking upload status."));
    xhr.send();
  });
}