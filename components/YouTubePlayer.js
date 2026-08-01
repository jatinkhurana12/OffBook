"use client";

// Embeds an Unlisted YouTube video. rel=0 keeps end-screen suggestions
// limited, modestbranding=1 trims the YouTube logo — as close to "feels
// native to OffBook" as an iframe embed gets, while the actual video
// still streams from YouTube's CDN.
export default function YouTubePlayer({ videoId, title }) {
  if (!videoId) return null;

  return (
    <div className="relative w-full aspect-video border-2 border-ink bg-black">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title || "Lecture video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}