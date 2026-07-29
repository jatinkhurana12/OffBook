"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { useEffect, useState } from "react";

export default function Nav({ session, avatarUrl }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

const UNREAD_POLL_MS = 15000;

// inside the component, alongside the existing menuOpen state:
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  if (!session) return;
  function loadUnread() {
    fetch("/api/messages/unread-count")
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.count || 0))
      .catch(() => {});
  }
  loadUnread();
  const interval = setInterval(loadUnread, UNREAD_POLL_MS);
  return () => clearInterval(interval);
}, [session]);

  return (
    <header className="border-b-2 border-ink bg-paper sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-5 flex items-center justify-between h-16">
        <Link href="/" className="font-display font-bold text-lg tracking-tight" onClick={closeMenu}>
          OFF<span className="strike">BOOK</span>
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/profile"
              onClick={closeMenu}
              aria-label="Your profile"
              className="shrink-0 block w-9 h-9 rounded-full border-2 border-ink overflow-hidden"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-panel flex items-center justify-center font-display font-bold text-xs">
                  {session.name.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
          ) : (
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/login" className="hover:text-pen">
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-ink text-paper px-4 py-2 font-display text-xs uppercase tracking-wider hover:bg-pen transition-colors"
              >
                Join
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="shrink-0 flex flex-col items-center justify-center gap-1.5 w-9 h-9 border-2 border-ink"
          >
            <span
              className={`block w-4 h-0.5 bg-ink transition-transform ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span className={`block w-4 h-0.5 bg-ink transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span
              className={`block w-4 h-0.5 bg-ink transition-transform ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            aria-hidden="true"
            tabIndex={-1}
            onClick={closeMenu}
            className="fixed inset-0 z-30 cursor-default bg-ink/20"
          />
          <nav className="relative z-40 border-t-2 border-ink bg-paper">
            <div className="max-w-5xl mx-auto px-5 py-4 flex flex-col gap-4 text-sm font-medium">
              <Link href="/dashboard" className="hover:text-pen" onClick={closeMenu}>
                Problems
              </Link>
              <Link href="/internships" className="hover:text-pen" onClick={closeMenu}>
                Internships
              </Link>
              <Link href="/members" className="hover:text-pen" onClick={closeMenu}>
                Directory
              </Link>
              {session && (
                <>
                  <Link href="/my-folks" className="hover:text-pen" onClick={closeMenu}>
                    My Folks
                  </Link>
              <Link
                href="/messages"
                className="hover:text-pen flex items-center gap-2"
                onClick={closeMenu}
              >
                Messages
                {unreadCount > 0 && (
                <span className="bg-pen text-paper text-[11px] font-display font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
                </span>
  )}
</Link>
                  <div className="border-t border-line -mx-5 px-5 pt-4 flex items-center justify-between">
                    <Link href="/profile" className="hover:text-pen" onClick={closeMenu}>
                      {session.name.split(" ")[0]}
                    </Link>
                    <LogoutButton />
                  </div>
                </>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}