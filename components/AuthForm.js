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
      <EmailField
        value={form.email}
        onChange={(v) => setForm({ ...form, email: v })}
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

const EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "rediffmail.com",
  "protonmail.com",
];

function EmailField({ value, onChange }) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const atIndex = value.indexOf("@");
  const username = atIndex === -1 ? value : value.slice(0, atIndex);
  const typedDomain = atIndex === -1 ? "" : value.slice(atIndex + 1);

  // Only show suggestions once there's a username and an "@" has been typed.
  const suggestions =
    atIndex !== -1 && username.length > 0
      ? EMAIL_DOMAINS.filter((d) => d.startsWith(typedDomain)).slice(0, 5)
      : [];

  function selectDomain(domain) {
    onChange(`${username}@${domain}`);
    setShowSuggestions(false);
  }

  return (
    <label className="block relative">
      <span className="block font-display text-xs uppercase tracking-widest text-muted mb-2">
        Email
      </span>
      <input
        type="email"
        required
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
        autoComplete="off"
        className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 mt-1 border-2 border-ink bg-panel shadow-[3px_3px_0_0_#17181A]">
          {suggestions.map((domain) => (
            <li key={domain}>
              <button
                type="button"
                // onMouseDown fires before the input's onBlur, so the click registers
                onMouseDown={() => selectDomain(domain)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-ink hover:text-paper transition-colors"
              >
                {username}
                <span className="text-pen">@{domain}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </label>
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