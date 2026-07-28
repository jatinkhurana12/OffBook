"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("idle");
        return;
      }
      // Always shown regardless of whether the account exists, by design.
      setStatus("done");
    } catch {
      setError("Something went wrong. Try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="font-display text-2xl font-bold mb-2">Reset your password</h1>
      <p className="text-muted text-sm mb-8">
        Enter the email on your account and we'll send you a link to reset your password.
      </p>

      {status === "done" ? (
        <p className="text-sm border-l-2 border-ink pl-3">
          If an account exists for that email, we've sent a link to reset your password. Check your
          inbox (and spam folder).
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="block font-display text-xs uppercase tracking-widest text-muted mb-2">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
            />
          </label>

          {error && (
            <p className="text-pen text-sm font-medium border-l-2 border-pen pl-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-ink text-paper py-3 font-display text-sm uppercase tracking-wider hover:bg-pen transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="text-sm text-muted mt-6">
        <Link href="/login" className="text-pen font-medium">
          Back to login
        </Link>
      </p>
    </div>
  );
}