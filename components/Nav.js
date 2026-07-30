"use client";

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
    <header className="border-b border-line/80 bg-paper/70 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-5 flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-display font-bold text-lg tracking-tight text-ink hover:text-cobalt transition-colors"
          onClick={closeMenu}
        >
          OFF<span className="strike">BOOK</span>
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/profile"
              onClick={closeMenu}
              aria-label="Your profile"
              className="shrink-0 block w-9 h-9 rounded-full border border-line overflow-hidden shadow-glow-sm"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-panel flex items-center justify-center font-display font-bold text-xs text-ink">
                  {session.name.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
          ) : (
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/login" className="text-muted hover:text-cobalt transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-ink text-paper px-4 py-2 font-display text-xs uppercase tracking-wider hover:shadow-glow-sm hover:-translate-y-0.5 transition-all duration-300"
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
            className="shrink-0 flex flex-col items-center justify-center gap-1.5 w-9 h-9 border border-line text-ink hover:border-cobalt hover:shadow-glow-sm transition-all"
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
            className="fixed inset-0 z-30 cursor-default bg-paper/60 backdrop-blur-sm"
          />
          <nav className="relative z-40 border-t border-line/80 glass">
            <div className="max-w-5xl mx-auto px-5 py-4 flex flex-col gap-4 text-sm font-medium">
              <Link href="/dashboard" className="text-ink hover:text-cobalt transition-colors" onClick={closeMenu}>
                Problems
              </Link>
              <Link href="/internships" className="text-ink hover:text-cobalt transition-colors" onClick={closeMenu}>
                Internships
              </Link>
              <Link href="/members" className="text-ink hover:text-cobalt transition-colors" onClick={closeMenu}>
                Directory
              </Link>
              {session && (
                <>
                  <Link href="/my-folks" className="text-ink hover:text-cobalt transition-colors" onClick={closeMenu}>
                    My Folks
                  </Link>
              <Link
                href="/messages"
                className="text-ink hover:text-cobalt transition-colors flex items-center gap-2"
                onClick={closeMenu}
              >
                Messages
                {unreadCount > 0 && (
                <span className="bg-pen text-ink text-[11px] font-display font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-glow-pen">
                {unreadCount > 9 ? "9+" : unreadCount}
                </span>
  )}
</Link>
                  <div className="border-t border-line -mx-5 px-5 pt-4 flex items-center justify-between">
                    <Link href="/profile" className="text-ink hover:text-cobalt transition-colors" onClick={closeMenu}>
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