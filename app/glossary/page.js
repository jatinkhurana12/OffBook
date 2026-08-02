"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlossaryButton from "../../components/GlossaryButton";

const SEVERITY_LABEL = {
  annoying: "Annoying",
  painful: "Painful",
  "deal-breaking": "Deal-breaking",
};

export default function Glossary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    fetch("/api/glossary")
      .then((r) => {
        if (r.status === 401) {
          setLoggedOut(true);
          return null;
        }
        return r.json();
      })
      .then((json) => {
        if (json) setData(json);
        setLoading(false);
      });
  }, []);

  if (loggedOut) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12 text-muted text-sm">
        <Link href="/login" className="underline hover:text-pen">
          Log in
        </Link>{" "}
        to see your Glossary.
      </div>
    );
  }

  const total = data ? data.lectures.length + data.problems.length + data.internships.length : 0;

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold flex items-center gap-3">
          <span className="text-pen" aria-hidden="true">❖</span> Glossary
        </h1>
        <p className="text-muted text-sm mt-1">
          Every lecture, article, problem, and internship you&apos;ve marked — just for you.
        </p>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : total === 0 ? (
        <div className="border-2 border-dashed border-line p-10 text-center">
          <p className="font-display text-sm text-muted uppercase tracking-wide">
            Nothing glossed yet
          </p>
          <p className="text-muted text-sm mt-2">
            Tap the ◇ on any lecture, article, problem, or internship to add it here.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {data.lectures.length > 0 && (
            <Section title="Lectures & articles">
              <ul className="space-y-3">
                {data.lectures.map((l) => (
                  <li
                    key={l.id}
                    className="border-2 border-ink bg-panel p-4 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-[11px] uppercase tracking-wide text-muted mb-1">
                        {l.type === "video" ? "Video lecture" : "Article"}
                      </p>
                      <Link
                        href={`/trailblazers/${l.user_id}`}
                        className="font-display font-semibold hover:text-pen break-words"
                      >
                        {l.title}
                      </Link>
                      <p className="text-xs text-muted mt-1">by {l.author_name}</p>
                    </div>
                    <GlossaryButton itemType="lecture" itemId={l.id} />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {data.problems.length > 0 && (
            <Section title="Problems">
              <ul className="space-y-3">
                {data.problems.map((p) => (
                  <li
                    key={p.id}
                    className="border-2 border-ink bg-panel p-4 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-[11px] uppercase tracking-wide text-muted mb-1">
                        {p.domain} · {SEVERITY_LABEL[p.severity] || p.severity}
                      </p>
                      <Link
                        href={`/problems/${p.id}`}
                        className="font-display font-semibold hover:text-pen break-words"
                      >
                        {p.title}
                      </Link>
                      <p className="text-xs text-muted mt-1">by {p.author_name}</p>
                    </div>
                    <GlossaryButton itemType="problem" itemId={p.id} />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {data.internships.length > 0 && (
            <Section title="Internships">
              <ul className="space-y-3">
                {data.internships.map((i) => (
                  <li
                    key={i.id}
                    className="border-2 border-ink bg-panel p-4 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-[11px] uppercase tracking-wide text-muted mb-1">
                        {i.paid ? "Paid" : "Unpaid"}
                      </p>
                      <Link
                        href={`/internships/${i.id}`}
                        className="font-display font-semibold hover:text-pen break-words"
                      >
                        {i.role_title}
                      </Link>
                      <p className="text-xs text-muted mt-1">
                        {i.organization} · posted by {i.poster_name}
                      </p>
                    </div>
                    <GlossaryButton itemType="internship" itemId={i.id} />
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-xs uppercase tracking-widest text-muted mb-3">{title}</h2>
      {children}
    </section>
  );
}