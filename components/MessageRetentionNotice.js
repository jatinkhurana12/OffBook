"use client";

import { useState } from "react";

// Small "i" icon meant to sit in the corner of the chat header. Clicking it
// opens a modal explaining the 72-hour auto-delete rule. Self-contained —
// drop <MessageRetentionNotice /> anywhere and it handles its own open state.
export default function MessageRetentionNotice() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Message retention rules"
        aria-label="Message retention rules"
        className="shrink-0 w-7 h-7 rounded-full border-2 border-ink flex items-center justify-center font-display text-xs font-bold hover:border-pen hover:text-pen transition-colors"
      >
        i
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-paper/80 px-5"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-w-sm w-full border-2 border-ink bg-panel p-6 shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-bold mb-3">Message retention</h2>
            <ul className="text-sm text-muted space-y-2 list-disc pl-4">
              <li>
                Messages are permanently deleted from the server 72 hours after they're sent —
                whether or not they've been read. This applies to everyone in the conversation.
              </li>
              <li>You can delete a message from your own view at any time by tapping it.</li>
              <li>You can delete the entire conversation from your own view whenever you like.</li>
              <li>
                Deleting a message or chat only removes it from your side — the other person
                still sees their copy until it's deleted for them too, or until 72 hours pass.
              </li>
            </ul>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full font-display text-xs uppercase tracking-wider px-5 py-2.5 border-2 border-ink bg-ink text-paper hover:bg-pen"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}