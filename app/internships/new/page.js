"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PAYMENT_PERIODS = ["hour", "week", "month", "project"];

export default function NewInternship() {
  const router = useRouter();
  const [form, setForm] = useState({
    role_title: "",
    organization: "",
    description: "",
    skills: "",
    paid: false,
    payment_amount: "",
    payment_period: "month",
    location: "remote",
    apply_instructions: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/internships", {
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
    router.push(`/internships/${data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-display text-2xl font-bold mb-2">Post an opening</h1>
      <p className="text-muted text-sm mb-8 max-w-md">
        There's no field here for degree, GPA, or years of schooling — on purpose.
        Describe the skills and the work. Let that be what people are judged on.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Role title">
            <input
              required
              value={form.role_title}
              onChange={(e) => setForm({ ...form, role_title: e.target.value })}
              placeholder="e.g. Frontend intern"
              className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
            />
          </Field>
          <Field label="Organization">
            <input
              required
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              placeholder="Your startup or project name"
              className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
            />
          </Field>
        </div>

        <Field label="What will they actually work on?">
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the work itself, not who's allowed to apply."
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        <Field label="Skills needed">
          <input
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            placeholder="e.g. react, figma, cold outreach"
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Location">
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Remote, or a city"
              className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
            />
          </Field>
          <Field label="How should people apply?">
            <input
              required
              value={form.apply_instructions}
              onChange={(e) => setForm({ ...form, apply_instructions: e.target.value })}
              placeholder="Email address or application link"
              className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
            />
          </Field>
        </div>

        <div className="border-2 border-ink bg-panel p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.paid}
              onChange={(e) => setForm({ ...form, paid: e.target.checked })}
              className="w-4 h-4 accent-ink"
            />
            <span className="font-display text-xs uppercase tracking-widest">
              This role is paid
            </span>
          </label>

          {form.paid && (
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Field label="Payment amount (USD)">
                <input
                  type="number"
                  min="1"
                  required={form.paid}
                  value={form.payment_amount}
                  onChange={(e) => setForm({ ...form, payment_amount: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
                />
              </Field>
              <Field label="Per">
                <select
                  value={form.payment_period}
                  onChange={(e) => setForm({ ...form, payment_period: e.target.value })}
                  className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
                >
                  {PAYMENT_PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}
        </div>

        {error && <p className="text-pen text-sm font-medium border-l-2 border-pen pl-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-ink text-paper px-6 py-3 font-display text-sm uppercase tracking-wider hover:bg-pen transition-colors disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post opening"}
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