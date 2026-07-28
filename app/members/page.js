"use client";

import { useEffect, useState } from "react";
import Avatar from "../../components/Avatar";

const AVAILABILITY_LABEL = {
  exploring: "Just exploring",
  "open-to-cofound": "Open to co-founding",
  "already-building": "Already building",
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/members?skill=${encodeURIComponent(skill)}`)
        .then((r) => r.json())
        .then((data) => {
          setMembers(data.members || []);
          setLoading(false);
        });
    }, 250);
    return () => clearTimeout(t);
  }, [skill]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-display text-2xl font-bold mb-2">Directory</h1>
      <p className="text-muted text-sm mb-8">Find people to build with, by what they bring.</p>

      <input
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        placeholder="Filter by skill — e.g. design, sales, backend..."
        className="w-full border-2 border-ink bg-panel px-4 py-2.5 mb-8 focus:outline-none focus:border-pen"
      />

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : members.length === 0 ? (
        <p className="text-muted text-sm">No one matches that skill yet.</p>
      ) : (
        <ul className="space-y-4">
          {members.map((m) => (
            <li key={m.id} className="border-2 border-ink bg-panel p-5">
 <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Avatar src={m.avatar_url} name={m.name} size="md" />
                  <div>
                    <h2 className="font-display font-semibold text-lg">{m.name}</h2>
                    {m.headline && <p className="text-sm text-muted mt-0.5">{m.headline}</p>}
                  </div>
                </div>
                 <span className="font-display text-[11px] uppercase tracking-wide text-pen whitespace-nowrap">
                  {AVAILABILITY_LABEL[m.availability] || m.availability}
                </span>
              </div>
              {m.left_because && (
                <p className="text-sm mt-3 border-l-2 border-line pl-3 text-muted italic">
                  &ldquo;{m.left_because}&rdquo;
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-4 text-xs">
                {m.skills && (
                  <span>
                    <strong className="font-display uppercase tracking-wide">Brings:</strong> {m.skills}
                  </span>
                )}
                {m.looking_for && (
                  <span>
                    <strong className="font-display uppercase tracking-wide">Wants:</strong> {m.looking_for}
                  </span>
                )}
              </div>
              {m.shipped && <p className="text-xs text-muted mt-3">Shipped: {m.shipped}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
