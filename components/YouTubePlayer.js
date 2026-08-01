"use client";

import { useState } from "react";

// Shows YouTube's own thumbnail first — via img.youtube.com, which works
// for Unlisted videos the same as Public ones, no API key or quota
// involved. The actual iframe player (and everything YouTube loads
// alongside it) only mounts once someone clicks play, which also keeps
// pages with several lectures on them fast to load.
export default function YouTubePlayer({ videoId, title }) {
  const [playing, setPlaying] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  if (!videoId) return null;

  if (playing) {
    return (
      <div className="relative w-full aspect-video border-2 border-ink bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
          title={title || "Lecture video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title || "video"}`}
      className="relative w-full aspect-video border-2 border-ink bg-black block group overflow-hidden"
    >
      {!thumbnailFailed && (
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={title || "Video thumbnail"}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setThumbnailFailed(true)}
        />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition-colors">
        <span className="w-16 h-16 rounded-full bg-paper/95 flex items-center justify-center border-2 border-ink group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 24 24" className="w-6 h-6 ml-1" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}