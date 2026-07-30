"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// Small bell button shown in the header for logged-in users. Lets them turn
// browser push notifications for new messages on or off, right from Offbook —
// no email involved.
export default function PushNotifications() {
  const [status, setStatus] = useState("checking"); // checking | unsupported | off | on | denied
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !VAPID_PUBLIC_KEY) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        const existing = await registration.pushManager.getSubscription();
        setStatus(existing ? "on" : "off");
      })
      .catch(() => setStatus("unsupported"));
  }, []);

  async function enable() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      setStatus("on");
    } catch (err) {
      console.error("[push] failed to enable notifications:", err);
    }
  }

  async function disable() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus("off");
    } catch (err) {
      console.error("[push] failed to disable notifications:", err);
    }
  }

  if (status === "unsupported" || status === "checking") return null;

  if (status === "denied") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowHint((open) => !open)}
          aria-label="Notifications blocked — click for how to fix this"
          title="Notifications are blocked in your browser settings"
          className="shrink-0 relative flex items-center justify-center w-9 h-9 border border-line text-muted hover:border-pen hover:text-pen transition-all duration-300"
        >
          <BellIcon slashed />
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-pen text-paper shadow-glow-pen">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>

        {showHint && (
          <div className="absolute right-0 top-11 z-50 w-56 glass shadow-panel p-3 text-xs text-muted animate-fade-up">
            <p className="text-ink font-medium mb-1">Notifications are blocked</p>
            <p>
              You declined the browser prompt (or blocked it earlier). Enable notifications for
              this site in your browser&apos;s address-bar site settings, then refresh the page.
            </p>
            <button
              type="button"
              onClick={() => setShowHint(false)}
              className="mt-2 nav-link text-cobalt"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={status === "on" ? disable : enable}
      aria-label={status === "on" ? "Turn off message notifications" : "Turn on message notifications"}
      title={status === "on" ? "Notifications on — click to turn off" : "Turn on message notifications"}
      className={`shrink-0 flex items-center justify-center w-9 h-9 border transition-all duration-300 ${
        status === "on"
          ? "border-cobalt text-cobalt shadow-glow-sm"
          : "border-line text-muted hover:border-cobalt hover:text-cobalt"
      }`}
    >
      <BellIcon slashed={status !== "on"} />
    </button>
  );
}

function BellIcon({ slashed }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 01-3.46 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {slashed && (
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}