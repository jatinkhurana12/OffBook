"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const checks = [
    { label: "9-12 characters", met: password.length >= 9 && password.length <= 12 },
    { label: "One capital letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    {
      label: "One special character",
      met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
    },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is missing its token. Request a new link.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setLoading(false);
      setError("Something went wrong. Try again.");
    }
  }

  if (!token) {
    return (
      <div className="max-w-sm mx-auto px-5 py-16">
        <h1 className="font-display text-2xl font-bold mb-2">Invalid link</h1>
        <p className="text-muted text-sm mb-6">
          This password reset link is missing or malformed.
        </p>
        <Link href="/forgot-password" className="text-pen font-medium text-sm">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-5 py-16">
        <h1 className="font-display text-2xl font-bold mb-2">Password updated</h1>
        <p className="text-muted text-sm">Taking you to the login page...</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="font-display text-2xl font-bold mb-2">Set a new password</h1>
      <p className="text-muted text-sm mb-8">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="block font-display text-xs uppercase tracking-widest text-muted mb-2">
            New password
          </span>
          <div className="flex border-2 border-ink bg-panel focus-within:border-pen">
            <input
              type={visible ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </label>

        <label className="block">
          <span className="block font-display text-xs uppercase tracking-widest text-muted mb-2">
            Confirm new password
          </span>
          <input
            type={visible ? "text" : "password"}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
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
          {loading ? "Saving..." : "Update password"}
        </button>
      </form>
    </div>
  );
}