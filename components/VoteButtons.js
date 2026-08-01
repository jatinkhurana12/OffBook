"use client";

import { useEffect, useRef, useState } from "react";

export default function VoteButtons({ problemId, initialUpvotes, initialDownvotes, initialMyVote, size = "md" }) {
  const [upvotes, setUpvotes] = useState(initialUpvotes || 0);
  const [downvotes, setDownvotes] = useState(initialDownvotes || 0);
  const [myVote, setMyVote] = useState(initialMyVote || 0);
  const [loading, setLoading] = useState(false);
  // While a vote is in flight (or was just cast), a background poll can
  // race the fetch response and briefly overwrite it with stale numbers.
  // This guards against that without needing a full request-token setup.
  const skipNextSyncRef = useRef(false);

  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    setUpvotes(initialUpvotes || 0);
    setDownvotes(initialDownvotes || 0);
    setMyVote(initialMyVote || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUpvotes, initialDownvotes, initialMyVote]);

  async function castVote(voteType, e) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    const res = await fetch(`/api/problems/${problemId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteType }),
    });
    setLoading(false);

    if (res.status === 401) {
      // Not logged in — just silently no-op rather than erroring the whole page.
      return;
    }
    if (!res.ok) return;

    const data = await res.json();
    // Ignore the next prop sync — it may be from a background poll that was
    // already in flight before this vote landed, and would otherwise
    // briefly flash the pre-vote counts back in.
    skipNextSyncRef.current = true;
    setUpvotes(data.upvotes);
    setDownvotes(data.downvotes);
    setMyVote(data.myVote);
  }

  const btnPad = size === "lg" ? "px-3 py-2" : "px-2 py-1";
  const textSize = size === "lg" ? "text-base" : "text-sm";

  return (
    <div className="flex items-center gap-1 font-display">
      <button
        type="button"
        onClick={(e) => castVote(1, e)}
        disabled={loading}
        title="Upvote"
        className={`${btnPad} border-2 ${
          myVote === 1 ? "bg-sage text-paper border-sage" : "border-line text-muted hover:border-ink hover:text-ink"
        } transition-colors`}
      >
        ▲
      </button>
      <span className={`${textSize} font-semibold min-w-[1.5rem] text-center`}>{upvotes}</span>
      <button
        type="button"
        onClick={(e) => castVote(-1, e)}
        disabled={loading}
        title="Downvote"
        className={`${btnPad} border-2 ${
          myVote === -1 ? "bg-pen text-paper border-pen" : "border-line text-muted hover:border-ink hover:text-ink"
        } transition-colors`}
      >
        ▼
      </button>
      <span className={`${textSize} font-semibold min-w-[1.5rem] text-center`}>{downvotes}</span>
    </div>
  );
}