"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Avatar from "../../../components/Avatar";
import FollowButton from "../../../components/FollowButton";

const AVAILABILITY_LABEL = {
  exploring: "Just exploring",
  "open-to-cofound": "Open to co-founding",
  "already-building": "Already building",
};

export default function MemberProfile() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [following, setFollowing] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    fetch(`/api/members/${id}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setMember(data.member);
        setFollowing(data.following);
        setIsSelf(data.isSelf);
        setLoading(false);
      });
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-muted text-sm">
          That member doesn't exist.{" "}
          <Link href="/members" className="underline hover:text-pen">
            Back to the directory
          </Link>
          .
        </p>
      </div>
    );
  }

  if (loading || !member) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-muted text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <div className="border-2 border-ink bg-panel p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <Avatar src={member.avatar_url} name={member.name} size="lg" />
            <div>
              <h1 className="font-display text-2xl font-bold">{member.name}</h1>
              {member.headline && <p className="text-muted mt-1">{member.headline}</p>}
              <span className="font-display text-[11px] uppercase tracking-wide text-pen inline-block mt-2">
                {AVAILABILITY_LABEL[member.availability] || member.availability}
              </span>
            </div>
          </div>

          {!isSelf && (
            <div className="flex gap-3">
              <FollowButton userId={member.id} initialFollowing={following} onChange={setFollowing} />
              <button>
                type="button"
              <Link
  href={`/messages/${f.id}`}   // use member.id on the profile page
  className="font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink bg-ink text-paper hover:bg-pen"
>
  Message
</Link>
              </button>
            </div>
          )}
        </div>

        {member.left_because && (
          <p className="text-sm mt-5 border-l-2 border-line pl-3 text-muted italic">
            &ldquo;{member.left_because}&rdquo;
          </p>
        )}

        {member.bio && <p className="text-sm mt-5 whitespace-pre-line">{member.bio}</p>}

        <div className="flex flex-wrap gap-6 mt-5 text-xs">
          {member.skills && (
            <span>
              <strong className="font-display uppercase tracking-wide">Brings:</strong> {member.skills}
            </span>
          )}
          {member.looking_for && (
            <span>
              <strong className="font-display uppercase tracking-wide">Wants:</strong>{" "}
              {member.looking_for}
            </span>
          )}
        </div>

        {member.shipped && (
          <p className="text-xs text-muted mt-4">
            <strong className="font-display uppercase tracking-wide">Shipped:</strong> {member.shipped}
          </p>
        )}

        {member.links && (
          <p className="text-xs text-muted mt-2">
            <strong className="font-display uppercase tracking-wide">Links:</strong> {member.links}
          </p>
        )}
      </div>

      {messaging && (
        <MessageModal userId={member.id} userName={member.name} onClose={() => setMessaging(false)} />
      )}
    </div>
  );
}