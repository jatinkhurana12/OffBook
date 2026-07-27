"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const DOMAINS = ["consumer", "b2b", "fintech", "healthcare", "education", "climate", "other"];
const SEVERITIES = ["annoying", "painful", "deal-breaking"];

export default function EditProblem() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch(`/api/problems/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.problem) {
          setLoadError("Couldn't load this problem.");
          return;
        }
        setForm({
          title: data.problem.title,
          domain: data.problem.domain,
          severity: data.problem.severity,
          description: data.problem.description,
          seeking: data.problem.seeking || "",
        });
      });
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/problems/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    router.push(`/problems/${id}`);
  }

  if (loadError) {
    return <div className="max-w-2xl mx-auto px-5 py-12 text-pen text-sm">{loadError}</div>;
  }
  if (!form) {
    return <div className="max-w-2xl mx-auto px-5 py-12 text-muted text-sm">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-display text-2xl font-bold mb-2">Edit problem</h1>
      <p className="text-muted text-sm mb-8">Update the details below.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="Title">
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
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
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        <Field label="Who are you hoping finds this? (optional)">
          <input
            value={form.seeking}
            onChange={(e) => setForm({ ...form, seeking: e.target.value })}
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        {error && <p className="text-pen text-sm font-medium border-l-2 border-pen pl-3">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-ink text-paper px-6 py-3 font-display text-sm uppercase tracking-wider hover:bg-pen transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/problems/${id}`)}
            className="border-2 border-ink px-6 py-3 font-display text-sm uppercase tracking-wider hover:border-pen hover:text-pen transition-colors"
          >
            Cancel
          </button>
        </div>
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