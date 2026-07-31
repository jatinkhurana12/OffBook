"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "../../components/Avatar";
import FollowButton from "../../components/FollowButton";

export default function Trailblazers() {
  const [trailblazers, setTrailblazers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => setMyUserId(data.session ? data.session.id : null));
  }, []);

  useEffect(() => {
    loadTrailblazers();
  }, []);

  function loadTrailblazers() {
    setLoading(true);
    fetch("/api/trailblazers")
      .then((r) => r.json())
      .then((data) => {
        setTrailblazers(data.trailblazers || []);
        setLoading(false);
      });
  }

  function handleFollowChange(id, following) {
    setTrailblazers((current) =>
      current.map((t) => (t.id === id ? { ...t, is_following: following } : t))
    );
  }

  const followed = trailblazers.filter((t) => t.is_following);
  const others = trailblazers.filter((t) => !t.is_following);

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-display text-2xl font-bold mb-2">Trailblazers</h1>
      <p className="text-muted text-sm mb-8">
        People teaching a skill or useful concept through video lectures or articles.
      </p>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : trailblazers.length === 0 ? (
        <p className="text-muted text-sm">
          No trailblazers yet. Head to your{" "}
          <Link href="/profile" className="underline hover:text-pen">
            profile
          </Link>{" "}
          to become the first one.
        </p>
      ) : (
        <>
          {followed.length > 0 && (
            <div className="mb-12">
              <h2 className="font-display text-sm uppercase tracking-widest text-muted mb-4">
                Your Followed Trailblazers
              </h2>
              <TrailblazerGrid
                trailblazers={followed}
                myUserId={myUserId}
                onFollowChange={handleFollowChange}
              />
            </div>
          )}

          <div>
            {followed.length > 0 && others.length > 0 && (
              <h2 className="font-display text-sm uppercase tracking-widest text-muted mb-4">
                All Trailblazers
              </h2>
            )}
            {others.length === 0 && followed.length > 0 ? (
              <p className="text-muted text-sm">
                You're following every trailblazer there is right now.
              </p>
            ) : (
              <TrailblazerGrid
                trailblazers={others}
                myUserId={myUserId}
                onFollowChange={handleFollowChange}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TrailblazerGrid({ trailblazers, myUserId, onFollowChange }) {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {trailblazers.map((t) => (
        <li
          key={t.id}
          className="border-2 border-ink bg-panel p-5 flex flex-col items-center text-center"
        >
          <Link href={`/members/${t.id}`} className="flex flex-col items-center group">
            <Avatar src={t.avatar_url} name={t.name} size="lg" />
            <h2 className="font-display font-semibold text-sm mt-3 group-hover:text-pen">
              {t.name}
            </h2>
            {t.niche && <p className="text-xs text-muted mt-1">{t.niche}</p>}
          </Link>
          {myUserId !== t.id && (
            <FollowButton
              userId={t.id}
              initialFollowing={t.is_following}
              onChange={(following) => onFollowChange(t.id, following)}
              className="mt-4"
            />
          )}
        </li>
      ))}
    </ul>
  );
}