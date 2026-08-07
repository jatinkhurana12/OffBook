"use client";

import { useEffect, useState } from "react";

// Small header button that offers to install Offbook to the user's Home
// Screen. On Chrome/Edge/Android we capture the browser's install prompt
// ourselves so we can show our own "Allow / Cancel" popup first — the
// native browser dialog still appears if the user taps Allow. iOS Safari
// doesn't support that event at all, so there we show short instructions
// instead since Apple only allows the user to trigger it manually.
export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [platform, setPlatform] = useState(null); // "android" | "ios" | null
  const [showPopup, setShowPopup] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already running as an installed app — nothing to offer.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    function onBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
      setPlatform("android");
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    function onInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari never fires beforeinstallprompt, so detect it directly and
    // fall back to a manual "how to" popup.
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isSafari = /safari/i.test(window.navigator.userAgent) && !/crios|fxios/i.test(window.navigator.userAgent);
    if (isIos && isSafari) {
      setPlatform("ios");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !platform) return null;

  async function handleAllow() {
    setShowPopup(false);
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  }

  function handleCancel() {
    setShowPopup(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPopup(true)}
        aria-label="Install Offbook to your phone"
        title="Add Offbook to your Home Screen"
        className="shrink-0 flex items-center justify-center w-9 h-9 border border-line text-muted hover:border-cobalt hover:text-cobalt transition-all duration-300"
      >
        <DownloadIcon />
      </button>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-hidden="true"
            tabIndex={-1}
            onClick={handleCancel}
            className="fixed inset-0 cursor-default bg-paper/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-xs glass shadow-panel p-4 text-sm animate-fade-up">
            <p className="text-ink font-display font-bold mb-1">Install Offbook</p>

            {platform === "android" ? (
              <>
                <p className="text-muted text-xs mb-3">
                  Add Offbook to your Home Screen for quick, full-screen access — no browser
                  bar, just the app.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAllow}
                    className="flex-1 bg-ink text-paper px-3 py-2 font-display text-xs uppercase tracking-wider hover:shadow-glow-sm transition-all duration-300"
                  >
                    Allow
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 border border-line text-muted px-3 py-2 font-display text-xs uppercase tracking-wider hover:border-cobalt hover:text-cobalt transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted text-xs mb-3">
                  To install: tap the Share icon in Safari, then choose &ldquo;Add to Home
                  Screen&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full border border-line text-ink px-3 py-2 font-display text-xs uppercase tracking-wider hover:border-cobalt hover:text-cobalt transition-all duration-300"
                >
                  Got it
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3v12m0 0l-4-4m4 4l4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}