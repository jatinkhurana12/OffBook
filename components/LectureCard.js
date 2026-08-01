"use client";

import { useState } from "react";
import YouTubePlayer from "./YouTubePlayer";

// Explicit DD/MM/YYYY, independent of the browser's locale.
function formatLectureDate(dateString) {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function LectureCard({ lecture, canManage, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lecture.title);
  const [description, setDescription] = useState(lecture.description || "");
  const [body, setBody] = useState(lecture.body || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function cancelEdit() {
    setEditing(false);
    setTitle(lecture.title);
    setDescription(lecture.description || "");
    setBody(lecture.body || "");
    setError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Title can't be empty.");
      return;
    }
    if (lecture.type === "article" && !body.trim()) {
      setError("Content can't be empty.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/trailblazers/lectures/${lecture.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save changes.");
      onUpdated({ ...lecture, title, description, body });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this lecture? This can't be undone.")) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/trailblazers/lectures/${lecture.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't delete that.");
      onDeleted(lecture.id);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <article className="border-2 border-ink bg-panel p-5">
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="font-display text-xs uppercase tracking-wide block mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-2 border-ink bg-paper px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="font-display text-xs uppercase tracking-wide block mb-1">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-2 border-ink bg-paper px-3 py-2 text-sm"
            />
          </div>
          {lecture.type === "article" && (
            <div>
              <label className="font-display text-xs uppercase tracking-wide block mb-1">
                Content
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="w-full border-2 border-ink bg-paper px-3 py-2 text-sm"
              />
            </div>
          )}
          {lecture.type === "video" && (
            <p className="text-xs text-muted">
              The video file itself can't be swapped here — delete and re-upload if you need to
              replace the footage. Title and description are OffBook's copy only, not YouTube's.
            </p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink bg-ink text-paper hover:bg-pen disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink bg-paper hover:bg-pen hover:text-paper"
            >
              Cancel
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="border-2 border-ink bg-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-lg font-bold mb-1 break-words">{lecture.title}</h2>
        {canManage && (
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="font-display text-[11px] uppercase tracking-wider px-3 py-1 border-2 border-ink bg-paper hover:bg-pen hover:text-paper"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="font-display text-[11px] uppercase tracking-wider px-3 py-1 border-2 border-ink bg-paper hover:bg-red-600 hover:text-paper hover:border-red-600 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {lecture.description && (
        <p className="text-muted text-sm mb-3 break-words">{lecture.description}</p>
      )}

      {lecture.type === "video" ? (
        <YouTubePlayer videoId={lecture.youtube_video_id} title={lecture.title} />
      ) : (
        <p className="text-sm whitespace-pre-line break-words">{lecture.body}</p>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <p className="text-xs text-muted mt-3">{formatLectureDate(lecture.created_at)}</p>
    </article>
  );
}