"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VideoUploadForm from "../../../components/VideoUploadForm";

export default function TrailblazerStudio() {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const [isTrailblazer, setIsTrailblazer] = useState(false);
  const [mode, setMode] = useState("video"); // "video" | "article"

  const [articleTitle, setArticleTitle] = useState("");
  const [articleDescription, setArticleDescription] = useState("");
  const [articleBody, setArticleBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [justPosted, setJustPosted] = useState(false);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => setSession(data.session || null));

    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setIsTrailblazer(!!data?.profile?.is_trailblazer));
  }, []);

  async function handleArticleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!articleTitle.trim() || !articleBody.trim()) {
      setError("Title and content are required.");
      return;
    }
    setPosting(true);
    try {
      const res = await fetch("/api/trailblazers/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "article",
          title: articleTitle,
          description: articleDescription,
          body: articleBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't post that.");
      setArticleTitle("");
      setArticleDescription("");
      setArticleBody("");
      setJustPosted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  if (session === undefined) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-muted text-sm">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-muted text-sm">
          <Link href="/login" className="underline hover:text-pen">
            Log in
          </Link>{" "}
          to post as a trailblazer.
        </p>
      </div>
    );
  }

  if (!isTrailblazer) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-muted text-sm">
          Only trailblazers can post lectures. Head to your{" "}
          <Link href="/profile" className="underline hover:text-pen">
            profile
          </Link>{" "}
          to turn that on.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-display text-2xl font-bold mb-2">Trailblazer Studio</h1>
      <p className="text-muted text-sm mb-8">Post an article or a video lecture.</p>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode("video");
            setJustPosted(false);
          }}
          className={`font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink ${
            mode === "video" ? "bg-ink text-paper" : "bg-paper hover:bg-pen hover:text-paper"
          }`}
        >
          Video lecture
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("article");
            setJustPosted(false);
          }}
          className={`font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink ${
            mode === "article" ? "bg-ink text-paper" : "bg-paper hover:bg-pen hover:text-paper"
          }`}
        >
          Article
        </button>
      </div>

      {justPosted && (
        <p className="text-xs text-green-700 mb-4">
          Posted. It'll show on your{" "}
          <Link href={`/trailblazers/${session.id}`} className="underline">
            trailblazer profile
          </Link>
          .
        </p>
      )}

      {mode === "video" ? (
        <VideoUploadForm onPosted={() => setJustPosted(true)} />
      ) : (
        <form onSubmit={handleArticleSubmit} className="space-y-4">
          <div>
            <label className="font-display text-xs uppercase tracking-wide block mb-1">
              Title
            </label>
            <input
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              className="w-full border-2 border-ink bg-paper px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="font-display text-xs uppercase tracking-wide block mb-1">
              Short description
            </label>
            <input
              value={articleDescription}
              onChange={(e) => setArticleDescription(e.target.value)}
              className="w-full border-2 border-ink bg-paper px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="font-display text-xs uppercase tracking-wide block mb-1">
              Content
            </label>
            <textarea
              value={articleBody}
              onChange={(e) => setArticleBody(e.target.value)}
              rows={12}
              className="w-full border-2 border-ink bg-paper px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={posting}
            className="font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink bg-ink text-paper hover:bg-pen disabled:opacity-50"
          >
            {posting ? "Posting..." : "Post article"}
          </button>
        </form>
      )}
    </div>
  );
}