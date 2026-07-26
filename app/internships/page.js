"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [paid, setPaid] = useState("all"); // "all" | "true" | "false"
  const [skill, setSkill] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const qs = new URLSearchParams();
      if (paid !== "all") qs.set("paid", paid);
      if (skill.trim()) qs.set("skill", skill.trim());
      if (minPayment) qs.set("minPayment", minPayment);

      fetch(`/api/internships?${qs.toString()}`)
        .then((r) => r.json())
        .then((data) => {
          setInternships(data.internships || []);
          setLoading(false);
        });
    }, 250);
    return () => clearTimeout(t);
  }, [paid, skill, minPayment]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Internships</h1>
          <p className="text-muted text-sm mt-1 max-w-md">
            Founders post real openings here. No degree checkboxes, no &ldquo;must be
            enrolled&rdquo; — just what you can actually do.
          </p>
        </div>
        <Link
          href="/internships/new"
          className="bg-ink text-paper px-5 py-2.5 font-display text-xs uppercase tracking-wider hover:bg-pen transition-colors whitespace-nowrap shrink-0"
        >
          Post an opening
        </Link>
      </div>

      <div className="border-2 border-ink bg-panel p-4 my-8 space-y-4">
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "true", label: "Paid" },
            { value: "false", label: "Unpaid" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPaid(opt.value)}
              className={`font-display text-xs uppercase tracking-wider px-3 py-1.5 border-2 ${
                paid === opt.value
                  ? "bg-ink text-paper border-ink"
                  : "border-line text-muted hover:border-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Filter by skill — e.g. react, design, sales..."
            className="w-full border-2 border-ink bg-panel px-3 py-2 text-sm focus:outline-none focus:border-pen"
          />
          <input
            type="number"
            min="0"
            value={minPayment}
            onChange={(e) => setMinPayment(e.target.value)}
            placeholder="Minimum pay (only applies to paid roles)"
            className="w-full border-2 border-ink bg-panel px-3 py-2 text-sm focus:outline-none focus:border-pen"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : internships.length === 0 ? (
        <div className="border-2 border-dashed border-line p-10 text-center">
          <p className="font-display text-sm text-muted uppercase tracking-wide">
            No openings match that filter
          </p>
          <p className="text-muted text-sm mt-2">
            Try widening your filters, or be the first to post one.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {internships.map((i) => (
            <li
              key={i.id}
              className="border-2 border-ink bg-panel p-5 hover:shadow-[4px_4px_0_0_#17181A] transition-shadow"
            >
              <Link href={`/internships/${i.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display font-semibold text-lg leading-snug">
                      {i.role_title}
                    </h2>
                    <p className="text-sm text-muted mt-0.5">{i.organization}</p>
                  </div>
                  <PaymentBadge internship={i} />
                </div>
                <p className="text-muted text-sm mt-3 line-clamp-2">{i.description}</p>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted font-medium flex-wrap">
                  <span className="uppercase font-display">{i.location}</span>
                  {i.skills && <span>Needs: {i.skills}</span>}
                  <span>Posted by {i.poster_name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PaymentBadge({ internship }) {
  if (!internship.paid) {
    return (
      <span className="font-display text-xs uppercase text-muted whitespace-nowrap border border-line px-2 py-1">
        Unpaid
      </span>
    );
  }
  return (
    <span className="font-display text-xs uppercase text-sage whitespace-nowrap border border-sage px-2 py-1">
      ${Number(internship.payment_amount).toLocaleString()}
      {internship.payment_period ? ` / ${internship.payment_period}` : ""}
    </span>
  );
}