"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "../../components/Avatar";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const POLL_MS = 8000;

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function load() {
      fetch("/api/messages")
        .then((r) => r.json())
        .then((data) => {
          setConversations(data.conversations || []);
          setLoading(false);
        });
    }
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-display text-2xl font-bold mb-2">Messages</h1>
      <p className="text-muted text-sm mb-8">Conversations with people on Offbook.</p>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : conversations.length === 0 ? (
        <p className="text-muted text-sm">
          No conversations yet. Visit someone's{" "}
          <Link href="/members" className="underline hover:text-pen">
            profile
          </Link>{" "}
          and hit Message to start one.
        </p>
      ) : (
        <ul className="border-2 border-ink divide-y-2 divide-ink bg-panel">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className="flex items-center gap-3 p-4 hover:bg-paper transition-colors"
              >
                <Avatar src={c.avatar_url} name={c.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display font-semibold">{c.name}</h2>
                    <span className="text-xs text-muted whitespace-nowrap">{timeAgo(c.last_at)}</span>
                  </div>
                  <p
                    className={`text-sm truncate mt-0.5 ${
                      c.unread_count > 0 ? "text-ink font-medium" : "text-muted"
                    }`}
                  >
                    {c.last_sender_id !== c.id ? "You: " : ""}
                    {c.last_body ||
                      (c.last_attachment_type
                        ? `📎 Sent a${c.last_attachment_type === "image" ? "n" : ""} ${c.last_attachment_type}`
                        : "")}
                  </p>
                </div>
                {c.unread_count > 0 && (
                  <span className="shrink-0 bg-pen text-paper text-xs font-display font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {c.unread_count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}