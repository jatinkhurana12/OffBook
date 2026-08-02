"use client";

import { useEffect, useState } from "react";

// The Glossary's uncommon mark: an outlined diamond when an item isn't
// glossed, a filled one once it is. Kept as a single small glyph so it
// reads the same whether it's sitting on a card or a detail page header.
const MARK_OFF = "◇";
const MARK_ON = "❖";

export default function GlossaryButton({ itemType, itemId, className = "" }) {
  const [glossed, setGlossed] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/glossary/${itemType}/${itemId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setGlossed(!!data.glossed);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [itemType, itemId]);

  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const res = await fetch(`/api/glossary/${itemType}/${itemId}`, {
      method: glossed ? "DELETE" : "POST",
    });
    setLoading(false);
    if (!res.ok) return;
    setGlossed((g) => !g);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading || !ready}
      title={glossed ? "Remove from Glossary" : "Add to Glossary"}
      aria-pressed={glossed}
      aria-label={glossed ? "Remove from Glossary" : "Add to Glossary"}
      className={`inline-flex items-center justify-center leading-none text-lg w-8 h-8 border-2 shrink-0 transition-colors disabled:opacity-50 ${
        glossed
          ? "border-pen text-pen bg-pen/10"
          : "border-line text-muted hover:border-pen hover:text-pen"
      } ${className}`}
    >
      <span aria-hidden="true">{glossed ? MARK_ON : MARK_OFF}</span>
    </button>
  );
}