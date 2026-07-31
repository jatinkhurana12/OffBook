"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wraps children and reveals them with a smooth fade/slide-in animation the
 * moment they scroll into view. Pure CSS transitions + IntersectionObserver,
 * no extra dependencies required.
 *
 * Usage:
 *   <ScrollReveal><section>...</section></ScrollReveal>
 *   <ScrollReveal direction="left" delay={150}>...</ScrollReveal>
 *
 * Props:
 *   direction  "up" | "down" | "left" | "right" | "scale"  (default "up")
 *   delay      ms before the animation starts once visible  (default 0)
 *   duration   ms for the animation itself                  (default 700)
 *   as         element tag to render as                     (default "div")
 *   className  extra classes merged onto the wrapper
 *   once       only animate the first time it enters view    (default true)
 */
export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 700,
  as: Tag = "div",
  className = "",
  once = true,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect users who've asked the OS for reduced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(node);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  const hiddenTransform =
    direction === "up"
      ? "translateY(32px)"
      : direction === "down"
      ? "translateY(-32px)"
      : direction === "left"
      ? "translateX(32px)"
      : direction === "right"
      ? "translateX(-32px)"
      : direction === "scale"
      ? "scale(0.94)"
      : "translateY(32px)";

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : hiddenTransform,
        transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1), transform ${duration}ms cubic-bezier(0.16,1,0.3,1)`,
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}