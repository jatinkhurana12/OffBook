"use client";

import { useEffect, useState } from "react";

/**
 * Thin gradient bar fixed to the very top of the viewport that fills as the
 * user scrolls down the page. Purely cosmetic, no dependencies.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-50 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-cobalt via-pen to-sage shadow-glow-sm"
        style={{ width: `${progress}%`, transition: "width 120ms ease-out" }}
      />
    </div>
  );
}