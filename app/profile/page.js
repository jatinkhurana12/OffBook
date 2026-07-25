"use client";

import { useEffect, useState } from "react";

const AVAILABILITY = ["exploring", "open-to-cofound", "already-building"];

export default function Profile() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setForm(data.profile);
        setLoading(false);
      });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaved(false);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading || !form) return <div className="max-w-2xl mx-auto px-5 py-12 text-muted text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-display text-2xl font-bold mb-1">{form.name}&apos;s profile</h1>
      <p className="text-muted text-sm mb-8">This is your build log — what you bring and what you've shipped.</p>

      <form onSubmit={handleSave} className="space-y-6">
        <Field label="Headline">
          <input
            value={form.headline || ""}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            placeholder="e.g. Self-taught backend dev, ex-community college"
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        <Field label="Why you left">
          <input
            value={form.left_because || ""}
            onChange={(e) => setForm({ ...form, left_because: e.target.value })}
            placeholder="e.g. Ran out of runway two semesters in"
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        <Field label="Bio">
          <textarea
            rows={4}
            value={form.bio || ""}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Skills you bring">
            <input
              value={form.skills || ""}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="design, react, sales"
              className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
            />
          </Field>
          <Field label="What you're looking for">
            <input
              value={form.looking_for || ""}
              onChange={(e) => setForm({ ...form, looking_for: e.target.value })}
              placeholder="a technical co-founder"
              className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
            />
          </Field>
        </div>

        <Field label="Availability">
          <select
            value={form.availability || "exploring"}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          >
            {AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>

        <Field label="What you've shipped">
          <input
            value={form.shipped || ""}
            onChange={(e) => setForm({ ...form, shipped: e.target.value })}
            placeholder="e.g. 2 side projects, 1 with paying users"
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        <Field label="Links">
          <input
            value={form.links || ""}
            onChange={(e) => setForm({ ...form, links: e.target.value })}
            placeholder="portfolio, github, twitter"
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        <button
          type="submit"
          className="bg-ink text-paper px-6 py-3 font-display text-sm uppercase tracking-wider hover:bg-pen transition-colors"
        >
          Save profile
        </button>
        {saved && <span className="ml-4 text-sage text-sm font-medium">Saved.</span>}
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
