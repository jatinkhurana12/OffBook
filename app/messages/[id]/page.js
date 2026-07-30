"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Avatar from "../../../components/Avatar";
import MessageRetentionNotice from "../../../components/MessageRetentionNotice";

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
  const [deletingId, setDeletingId] = useState(null);
  const [clearingChat, setClearingChat] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

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

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let picking the same file twice re-trigger onChange
    if (!file) return;

    setError("");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/messages/upload", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      setError(data.error || "Couldn't upload that file. Try again.");
      return;
    }
    setPendingAttachment(data.attachment);
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text && !pendingAttachment) return;
    setSending(true);
    setError("");
    const res = await fetch(`/api/messages/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, attachment: pendingAttachment || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setError(data.error || "Couldn't send that. Try again.");
      return;
    }
    setMessages((current) => [...current, data.message]);
    setBody("");
    setPendingAttachment(null);
  }

  async function handleDeleteMessage(messageId) {
    if (!window.confirm("Delete this message for you? The other person will still see theirs.")) {
      return;
    }
    setDeletingId(messageId);
    const res = await fetch(`/api/messages/message/${messageId}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      setMessages((current) => current.filter((m) => m.id !== messageId));
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't delete that message. Try again.");
    }
  }

  async function handleClearChat() {
    if (
      !window.confirm(
        "Delete this entire conversation for you? The other person will still see their copy."
      )
    ) {
      return;
    }
    setClearingChat(true);
    const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
    setClearingChat(false);
    if (res.ok) {
      setMessages([]);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't clear this chat. Try again.");
    }
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
        <div className="ml-auto flex items-center gap-2">
          <MessageRetentionNotice />
          <button
            type="button"
            onClick={handleClearChat}
            disabled={clearingChat || messages.length === 0}
            title="Delete this chat for you"
            className="font-display text-xs uppercase tracking-wider px-3 py-1.5 border-2 border-ink hover:border-pen hover:text-pen disabled:opacity-40"
          >
            {clearingChat ? "..." : "Delete chat"}
          </button>
        </div>
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
              <div key={m.id} className={`flex items-center gap-2 group ${mine ? "justify-end" : "justify-start"}`}>
                {mine && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(m.id)}
                    disabled={deletingId === m.id}
                    title="Delete for you"
                    aria-label="Delete message"
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-pen text-xs transition-opacity disabled:opacity-100"
                  >
                    ✕
                  </button>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 border-2 border-ink text-sm whitespace-pre-line ${
                    mine ? "bg-ink text-paper" : "bg-panel"
                  }`}
                >
                  {m.attachment_url && (
                    <div className={m.body ? "mb-2" : ""}>
                      {m.attachment_type === "image" && (
                        <a href={m.attachment_url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={m.attachment_url}
                            alt={m.attachment_name || "Shared image"}
                            className="max-w-full max-h-72 border-2 border-ink"
                          />
                        </a>
                      )}
                      {m.attachment_type === "video" && (
                        <video
                          src={m.attachment_url}
                          controls
                          className="max-w-full max-h-72 border-2 border-ink"
                        />
                      )}
                      {m.attachment_type === "audio" && (
                        <audio src={m.attachment_url} controls className="max-w-full" />
                      )}
                    </div>
                  )}
                  {m.body}
                </div>
                {!mine && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(m.id)}
                    disabled={deletingId === m.id}
                    title="Delete for you"
                    aria-label="Delete message"
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-pen text-xs transition-opacity disabled:opacity-100"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {pendingAttachment && (
        <div className="flex items-center gap-2 border-2 border-ink bg-panel px-3 py-2 mb-3 text-xs">
          {pendingAttachment.type === "image" ? (
            <img src={pendingAttachment.url} alt="" className="h-10 w-10 object-cover border border-ink" />
          ) : (
            <span className="font-display uppercase tracking-wider">{pendingAttachment.type}</span>
          )}
          <span className="truncate flex-1">{pendingAttachment.name}</span>
          <button
            type="button"
            onClick={() => setPendingAttachment(null)}
            className="text-muted hover:text-pen"
            aria-label="Remove attachment"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="border-t-2 border-ink pt-4 flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,audio/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !!pendingAttachment}
          title="Attach an image, audio, or video file"
          aria-label="Attach a file"
          className="font-display text-xs uppercase tracking-wider px-3 py-2.5 border-2 border-ink hover:border-pen hover:text-pen disabled:opacity-40"
        >
          {uploading ? "..." : "📎"}
        </button>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 border-2 border-ink bg-panel px-4 py-2.5 text-sm focus:outline-none focus:border-pen"
        />
        <button
          type="submit"
          disabled={sending || uploading || (!body.trim() && !pendingAttachment)}
          className="font-display text-xs uppercase tracking-wider px-5 py-2.5 border-2 border-ink bg-ink text-paper hover:bg-pen disabled:opacity-50"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
      {error && <p className="text-pen text-xs mt-2">{error}</p>}
    </div>
  );
}