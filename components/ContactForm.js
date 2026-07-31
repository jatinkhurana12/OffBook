"use client";

import { useState } from "react";

const initialForm = { name: "", email: "", phone: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong. Try again.");
      return;
    }
    setSent(true);
    setForm(initialForm);
  }

  if (sent) {
    return (
      <div className="glass shadow-panel p-8 text-center">
        <p className="font-display text-lg font-semibold text-sage mb-2">Message sent.</p>
        <p className="text-muted text-sm mb-6">
          Thanks for reaching out — we&apos;ll reply to your email soon.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="border border-line px-5 py-2.5 font-display text-xs uppercase tracking-wider text-ink hover:border-cobalt hover:text-cobalt hover:shadow-glow-sm transition-all duration-300"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass shadow-panel p-8 space-y-5">
      <TextField
        label="Name"
        type="text"
        value={form.name}
        onChange={(v) => update("name", v)}
        required
      />
      <TextField
        label="Email"
        type="email"
        value={form.email}
        onChange={(v) => update("email", v)}
        required
      />
      <TextField
        label="Phone (optional)"
        type="tel"
        value={form.phone}
        onChange={(v) => update("phone", v)}
      />
      <label className="block">
        <span className="block font-display text-xs uppercase tracking-widest text-muted mb-2">
          Message
        </span>
        <textarea
          required
          rows={5}
          maxLength={4000}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen resize-y"
          placeholder="What's on your mind?"
        />
      </label>

      {error && (
        <p className="text-pen text-sm font-medium border-l-2 border-pen pl-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink text-paper py-3 font-display text-sm uppercase tracking-wider hover:bg-pen transition-colors disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}

function TextField({ label, type, value, onChange, required }) {
  return (
    <label className="block">
      <span className="block font-display text-xs uppercase tracking-widest text-muted mb-2">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
      />
    </label>
  );
}