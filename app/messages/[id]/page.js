"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Avatar from "../../../components/Avatar";

const POLL_MS = 4000;

export default function Conversation() {
  const { id } = useParams();
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [myUserId, setMyUserId] = useState(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => setMyUserId(data.session ? data.session.id : null));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function load() {
    fetch(`/api/messages/${id}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setOtherUser(data.otherUser);
        setMessages(data.messages || []);
        setLoading(false);
      });
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setError("");
    const res = await fetch(`/api/messages/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setError(data.error || "Couldn't send that. Try again.");
      return;
    }
    setMessages((current) => [...current, data.message]);
    setBody("");
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-muted text-sm">
          That person doesn't exist.{" "}
          <Link href="/messages" className="underline hover:text-pen">
            Back to Messages
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 pb-4 border-b-2 border-ink">
        <Link href="/messages" className="font-display text-xs uppercase tracking-wider hover:text-pen">
          &larr; Back
        </Link>
        {otherUser && (
          <Link href={`/members/${otherUser.id}`} className="flex items-center gap-2 ml-2 group">
            <Avatar src={otherUser.avatar_url} name={otherUser.name} size="sm" />
            <span className="font-display font-semibold group-hover:text-pen">{otherUser.name}</span>
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-3">
        {loading ? (
          <p className="text-muted text-sm">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-muted text-sm">
            No messages yet. Say hi to {otherUser?.name.split(" ")[0]}.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === myUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 border-2 border-ink text-sm whitespace-pre-line ${
                    mine ? "bg-ink text-paper" : "bg-panel"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t-2 border-ink pt-4 flex gap-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 border-2 border-ink bg-panel px-4 py-2.5 text-sm focus:outline-none focus:border-pen"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="font-display text-xs uppercase tracking-wider px-5 py-2.5 border-2 border-ink bg-ink text-paper hover:bg-pen disabled:opacity-50"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
      {error && <p className="text-pen text-xs mt-2">{error}</p>}
    </div>
  );
}