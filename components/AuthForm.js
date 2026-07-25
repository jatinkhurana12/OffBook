"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const url = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const res = await fetch(url, {
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
    router.push(params.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "signup" && (
        <Field
          label="Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          type="text"
          required
        />
      )}
      <Field
        label="Email"
        value={form.email}
        onChange={(v) => setForm({ ...form, email: v })}
        type="email"
        required
      />
      <Field
        label="Password"
        value={form.password}
        onChange={(v) => setForm({ ...form, password: v })}
        type="password"
        required
      />
      {error && (
        <p className="text-pen text-sm font-medium border-l-2 border-pen pl-3">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink text-paper py-3 font-display text-sm uppercase tracking-wider hover:bg-pen transition-colors disabled:opacity-50"
      >
        {loading ? "Working..." : mode === "signup" ? "Create account" : "Log in"}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, type, required }) {
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
