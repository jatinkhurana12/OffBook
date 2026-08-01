"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Avatar from "../../../components/Avatar";
import LectureCard from "../../../components/LectureCard";

export default function TrailblazerProfile() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [myUserId, setMyUserId] = useState(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => setMyUserId(data.session ? data.session.id : null));

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

  function handleUpdated(updated) {
    setLectures((current) => current.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
  }

  function handleDeleted(lectureId) {
    setLectures((current) => current.filter((l) => l.id !== lectureId));
  }

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

  const canManage = myUserId !== null && Number(id) === myUserId;

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
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              canManage={canManage}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}