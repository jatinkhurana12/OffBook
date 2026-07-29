"use client";

import { useState } from "react";

export default function MessageModal({ userId, userName, onClose }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError("");
    const res = await fetch(`/api/message/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setError(data.error || "Couldn't send that. Try again.");
      return;
    }
    setSent(true);
  }

  return (
    <>
      <button
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-ink/30"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
        <div className="w-full max-w-sm border-2 border-ink bg-panel p-6">
          {sent ? (
            <>
              <h2 className="font-display font-bold text-lg mb-2">Sent</h2>
              <p className="text-sm text-muted mb-6">
                Your message is on its way to {userName}. They can reply straight to your email.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink bg-ink text-paper hover:bg-pen w-full"
              >
                Close
              </button>
            </>
          ) : (
            <form onSubmit={handleSend}>
              <h2 className="font-display font-bold text-lg mb-1">Message {userName}</h2>
              <p className="text-xs text-muted mb-4">
                Sent as an email — they can reply directly to you.
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Say hi to ${userName}...`}
                rows={5}
                autoFocus
                className="w-full border-2 border-ink bg-panel px-3 py-2 text-sm focus:outline-none focus:border-pen resize-none"
              />
              {error && <p className="text-pen text-xs mt-2">{error}</p>}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink bg-panel hover:text-pen hover:border-pen flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-ink bg-ink text-paper hover:bg-pen disabled:opacity-50 flex-1"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}