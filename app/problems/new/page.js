"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DOMAINS = ["consumer", "b2b", "fintech", "healthcare", "education", "climate", "other"];
const SEVERITIES = ["annoying", "painful", "deal-breaking"];

export default function NewProblem() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    domain: "consumer",
    severity: "painful",
    description: "",
    seeking: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    router.push(`/problems/${data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-display text-2xl font-bold mb-2">Post a problem</h1>
      <p className="text-muted text-sm mb-8">
        Describe friction you personally hit — not a pitch, not a solution. Just the problem.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="Title">
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Freelancers can't get paid across borders without 8% in fees"
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Domain">
            <select
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Severity">
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="What's the problem, in detail?">
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Who has this problem, how often, and how did you personally run into it?"
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        <Field label="Who are you hoping finds this? (optional)">
          <input
            value={form.seeking}
            onChange={(e) => setForm({ ...form, seeking: e.target.value })}
            placeholder="e.g. Someone technical who's hit this too"
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        {error && <p className="text-pen text-sm font-medium border-l-2 border-pen pl-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-ink text-paper px-6 py-3 font-display text-sm uppercase tracking-wider hover:bg-pen transition-colors disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post problem"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block font-display text-xs uppercase tracking-widest text-muted mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}
