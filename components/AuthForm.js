"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { validatePassword } from "../lib/validators";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [captcha, setCaptcha] = useState({ question: "", token: "" });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = useCallback(async () => {
    setCaptchaAnswer("");
    try {
      const res = await fetch("/api/captcha");
      const data = await res.json();
      setCaptcha(data);
    } catch {
      setCaptcha({ question: "", token: "" });
    }
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      const { valid, errors } = validatePassword(form.password);
      if (!valid) {
        setError(errors[0]);
        return;
      }
    }

    setLoading(true);
    const url = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        captchaToken: captcha.token,
        captchaAnswer,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      refreshCaptcha();
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
      <PasswordField
        value={form.password}
        onChange={(v) => setForm({ ...form, password: v })}
        showRequirements={mode === "signup"}
      />
      <Captcha
        question={captcha.question}
        answer={captchaAnswer}
        onAnswerChange={setCaptchaAnswer}
        onRefresh={refreshCaptcha}
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

function PasswordField({ value, onChange, showRequirements }) {
  const [visible, setVisible] = useState(false);

  const checks = [
    { label: "9-12 characters", met: value.length >= 9 && value.length <= 12 },
    { label: "One capital letter", met: /[A-Z]/.test(value) },
    { label: "One number", met: /[0-9]/.test(value) },
    { label: "One special character", met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value) },
  ];

  return (
    <label className="block">
      <span className="block font-display text-xs uppercase tracking-widest text-muted mb-2">
        Password
      </span>
      <div className="flex border-2 border-ink bg-panel focus-within:border-pen">
        <input
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 px-4 py-2.5 bg-transparent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="shrink-0 border-l-2 border-ink px-4 font-display text-xs uppercase tracking-wide bg-panel text-ink hover:bg-ink hover:text-paper transition-colors"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {showRequirements && (
        <ul className="mt-2 space-y-1">
          {checks.map((c) => (
            <li
              key={c.label}
              className={`text-xs font-medium flex items-center gap-1.5 ${
                c.met ? "text-sage" : "text-pen"
              }`}
            >
              <span className="font-display">{c.met ? "✓" : "✕"}</span>
              {c.label}
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}

function Captcha({ question, answer, onAnswerChange, onRefresh }) {
  return (
    <label className="block">
      <span className="block font-display text-xs uppercase tracking-widest text-muted mb-2">
        Quick check — you're human, right?
      </span>
      <div className="flex gap-3">
        <div className="flex-1 border-2 border-ink bg-panel px-4 py-2.5 font-display text-base flex items-center justify-between">
          <span>{question ? `${question} = ?` : "Loading..."}</span>
          <button
            type="button"
            onClick={onRefresh}
            title="Get a new question"
            className="text-muted hover:text-pen text-xs font-display uppercase tracking-wide"
          >
            ↻ New
          </button>
        </div>
        <input
          type="number"
          required
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="?"
          className="w-20 border-2 border-ink bg-panel px-3 py-2.5 text-center focus:outline-none focus:border-pen"
        />
      </div>
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