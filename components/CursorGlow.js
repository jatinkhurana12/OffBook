"use client";

import { useEffect, useRef } from "react";

/**
 * A soft radial glow that follows the pointer around the page — a subtle
 * "ambient light" touch that reads as futuristic without being distracting.
 * Automatically disabled on touch devices and for prefers-reduced-motion.
 */
export default function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    let raf = null;

    function onMove(e) {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!el) return;
        el.style.transform = `translate(${e.clientX - 220}px, ${e.clientY - 220}px)`;
        el.style.opacity = "1";
      });
    }

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed top-0 left-0 w-[440px] h-[440px] rounded-full opacity-0 pointer-events-none z-[1] transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(circle, rgba(79,143,255,0.10) 0%, rgba(255,61,129,0.05) 45%, transparent 70%)",
        filter: "blur(10px)",
      }}
    />
  );
}