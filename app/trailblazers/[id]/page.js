"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Avatar from "../../../components/Avatar";
import YouTubePlayer from "../../../components/YouTubePlayer";

// Explicit DD/MM/YYYY, independent of the browser's locale — avoids
// toLocaleDateString() rendering "1/8/2026" for one visitor and
// "8/1/2026" for another on the exact same date.
function formatLectureDate(dateString) {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function TrailblazerProfile() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/members/${id}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => data && setMember(data.member));

    fetch(`/api/trailblazers/lectures?trailblazer_id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setLectures(data.lectures || []);
        setLoading(false);
      });
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-muted text-sm">
          That trailblazer doesn't exist.{" "}
          <Link href="/trailblazers" className="underline hover:text-pen">
            Back to Trailblazers
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      {member && (
        <div className="flex items-center gap-4 mb-8">
          <Avatar src={member.avatar_url} name={member.name} size="lg" />
          <div>
            <h1 className="font-display text-2xl font-bold">{member.name}</h1>
            {member.headline && <p className="text-muted text-sm mt-1">{member.headline}</p>}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : lectures.length === 0 ? (
        <p className="text-muted text-sm">No lectures posted yet.</p>
      ) : (
        <div className="space-y-8">
          {lectures.map((lecture) => (
            <article key={lecture.id} className="border-2 border-ink bg-panel p-5">
              <h2 className="font-display text-lg font-bold mb-1 break-words">{lecture.title}</h2>
              {lecture.description && (
                <p className="text-muted text-sm mb-3 break-words">{lecture.description}</p>
              )}
              {lecture.type === "video" ? (
                <YouTubePlayer videoId={lecture.youtube_video_id} title={lecture.title} />
              ) : (
                <p className="text-sm whitespace-pre-line break-words">{lecture.body}</p>
              )}
              <p className="text-xs text-muted mt-3">{formatLectureDate(lecture.created_at)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}