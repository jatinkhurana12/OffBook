"use client";

import { useState } from "react";

// Uploads a video straight from the browser to YouTube, bypassing our own
// server entirely — Vercel's serverless functions cap request bodies at
// around 4.5MB, nowhere near enough for a video file. Flow:
//   1. Ask our API for a YouTube resumable upload session URL.
//   2. PUT the file bytes directly to that URL, tracking progress.
//   3. YouTube's response includes the new video's ID — save the lecture.
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

      const videoId = await uploadWithProgress(initData.uploadUrl, file, setProgress);

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

// XHR (not fetch) so we get upload progress events — fetch still can't
// reliably report request-body progress across browsers.
function uploadWithProgress(uploadUrl, file, setProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data.id);
        } catch {
          reject(new Error("YouTube didn't return a video ID."));
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status}). Try again.`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(file);
  });
}