"use client";

import { useState } from "react";

export default function FollowButton({ userId, initialFollowing, onChange, className = "" }) {
  const [following, setFollowing] = useState(!!initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/follow/${userId}`, {
      method: following ? "DELETE" : "POST",
    });
    setLoading(false);
    if (!res.ok) return;
    const nowFollowing = !following;
    setFollowing(nowFollowing);
    onChange?.(nowFollowing);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink transition-colors disabled:opacity-50 ${
        following ? "bg-panel text-ink hover:border-pen hover:text-pen" : "bg-ink text-paper hover:bg-pen"
      } ${className}`}
    >
      {loading ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}