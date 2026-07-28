"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VoteButtons from "../../components/VoteButtons";
import Avatar from "../../components/Avatar";

const DOMAINS = ["all", "consumer", "b2b", "fintech", "healthcare", "education", "climate", "other"];
const SEVERITY_LABEL = {
  annoying: "Annoying",
  painful: "Painful",
  "deal-breaking": "Deal-breaking",
};
const SEVERITY_COLOR = {
  annoying: "text-mustard",
  painful: "text-pen",
  "deal-breaking": "text-pen font-bold",
};

export default function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [domain, setDomain] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/problems?domain=${domain}`)
      .then((r) => r.json())
      .then((data) => {
        setProblems(data.problems || []);
        setLoading(false);
      });
  }, [domain]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Problem board</h1>
          <p className="text-muted text-sm mt-1">Real friction, posted by people who lived it.</p>
        </div>
        <Link
          href="/problems/new"
          className="bg-ink text-paper px-5 py-2.5 font-display text-xs uppercase tracking-wider hover:bg-pen transition-colors whitespace-nowrap"
        >
          Post a problem
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => setDomain(d)}
            className={`font-display text-xs uppercase tracking-wider px-3 py-1.5 border-2 ${
              domain === d ? "bg-ink text-paper border-ink" : "border-line text-muted hover:border-ink"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : problems.length === 0 ? (
        <div className="border-2 border-dashed border-line p-10 text-center">
          <p className="font-display text-sm text-muted uppercase tracking-wide">
            Nothing here yet
          </p>
          <p className="text-muted text-sm mt-2">Be the first to post a problem in this domain.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {problems.map((p) => (
            <li key={p.id} className="border-2 border-ink bg-panel p-5 hover:shadow-[4px_4px_0_0_#17181A] transition-shadow">
              <Link href={`/problems/${p.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display font-semibold text-lg leading-snug">{p.title}</h2>
                  <span className={`font-display text-xs uppercase whitespace-nowrap ${SEVERITY_COLOR[p.severity] || ""}`}>
                    {SEVERITY_LABEL[p.severity] || p.severity}
                  </span>
                </div>
                <p className="text-muted text-sm mt-2 line-clamp-2">{p.description}</p>
              </Link>
              <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
              <div className="flex items-center gap-4 text-xs text-muted font-medium">
                   <span className="flex items-center gap-2">
                     <Avatar src={p.author_avatar_url} name={p.author_name} size="xs" />
                     by {p.author_name}
                   </span>
                   <span className="uppercase font-display">{p.domain}</span>
                  <Link href={`/problems/${p.id}`} className="hover:text-pen">
                    {p.comment_count} {p.comment_count === 1 ? "reply" : "replies"}
                  </Link>
                </div>
                <VoteButtons
                  problemId={p.id}
                  initialUpvotes={p.upvotes}
                  initialDownvotes={p.downvotes}
                  initialMyVote={p.my_vote}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}