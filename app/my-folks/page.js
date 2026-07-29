"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "../../components/Avatar";

const AVAILABILITY_LABEL = {
  exploring: "Just exploring",
  "open-to-cofound": "Open to co-founding",
  "already-building": "Already building",
};

export default function MyFolks() {
  const [folks, setFolks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(null); // { id, name } | null
  const [unfollowingId, setUnfollowingId] = useState(null);

  useEffect(() => {
    loadFolks();
  }, []);

  function loadFolks() {
    setLoading(true);
    fetch("/api/follows")
      .then((r) => r.json())
      .then((data) => {
        setFolks(data.folks || []);
        setLoading(false);
      });
  }

  async function handleUnfollow(id) {
    setUnfollowingId(id);
    const res = await fetch(`/api/follow/${id}`, { method: "DELETE" });
    setUnfollowingId(null);
    if (res.ok) {
      setFolks((current) => current.filter((f) => f.id !== id));
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-display text-2xl font-bold mb-2">My Folks</h1>
      <p className="text-muted text-sm mb-8">The people you follow, all in one place.</p>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : folks.length === 0 ? (
        <p className="text-muted text-sm">
          You're not following anyone yet. Head to the{" "}
          <Link href="/members" className="underline hover:text-pen">
            Directory
          </Link>{" "}
          to find people to build with.
        </p>
      ) : (
        <ul className="space-y-4">
          {folks.map((f) => (
            <li key={f.id} className="border-2 border-ink bg-panel p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <Link href={`/members/${f.id}`} className="flex items-start gap-3 group">
                  <Avatar src={f.avatar_url} name={f.name} size="md" />
                  <div>
                    <h2 className="font-display font-semibold text-lg group-hover:text-pen">
                      {f.name}
                    </h2>
                    {f.headline && <p className="text-sm text-muted mt-0.5">{f.headline}</p>}
                  </div>
                </Link>
                <span className="font-display text-[11px] uppercase tracking-wide text-pen whitespace-nowrap">
                  {AVAILABILITY_LABEL[f.availability] || f.availability}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <Link
                  href={`/members/${f.id}`}
                  className="font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink bg-panel hover:text-pen hover:border-pen"
                >
                  View profile
                </Link>
<Link
  href={`/messages/${f.id}`}
  className="font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink bg-ink text-paper hover:bg-pen"
>
  Message
</Link>
                <button
                  type="button"
                  onClick={() => handleUnfollow(f.id)}
                  disabled={unfollowingId === f.id}
                  className="font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink bg-panel hover:text-pen hover:border-pen disabled:opacity-50"
                >
                  {unfollowingId === f.id ? "..." : "Unfollow"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}