"use client";

import { useEffect, useState } from "react";

export default function Admin() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [links, setLinks] = useState({}); // userId -> { url, expiresAt, loading, error, copied }

  useEffect(() => {
    fetch("/api/admin/users")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Something went wrong.");
        setUsers(data.users);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handleGenerateLink(userId) {
    setLinks((l) => ({ ...l, [userId]: { ...l[userId], loading: true, error: "" } }));

    const res = await fetch("/api/admin/reset-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLinks((l) => ({ ...l, [userId]: { loading: false, error: data.error || "Failed." } }));
      return;
    }

    setLinks((l) => ({
      ...l,
      [userId]: { loading: false, url: data.resetUrl, expiresAt: data.expiresAt, copied: false },
    }));
  }

  async function handleCopy(userId, url) {
    try {
      await navigator.clipboard.writeText(url);
      setLinks((l) => ({ ...l, [userId]: { ...l[userId], copied: true } }));
      setTimeout(() => {
        setLinks((l) => ({ ...l, [userId]: { ...l[userId], copied: false } }));
      }, 2000);
    } catch {
      // Clipboard API can fail (e.g. non-HTTPS, permissions) — the link
      // text is still visible on screen for manual copy in that case.
    }
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!users) {
    return <div className="max-w-4xl mx-auto px-5 py-12 text-muted text-sm">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="font-display text-2xl font-bold mb-1">Users</h1>
      <p className="text-muted text-sm mb-8">{users.length} accounts on OffBook.</p>

      <div className="border-2 border-ink bg-panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-ink text-left">
              <th className="px-4 py-3 font-display uppercase text-xs tracking-wide">Name</th>
              <th className="px-4 py-3 font-display uppercase text-xs tracking-wide">Email</th>
              <th className="px-4 py-3 font-display uppercase text-xs tracking-wide">Joined</th>
              <th className="px-4 py-3 font-display uppercase text-xs tracking-wide">Password reset</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const state = links[u.id] || {};
              return (
                <tr key={u.id} className="border-b border-line last:border-0 align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{u.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{u.email}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 min-w-[240px]">
                    {!state.url ? (
                      <button
                        type="button"
                        onClick={() => handleGenerateLink(u.id)}
                        disabled={state.loading}
                        className="border-2 border-ink px-3 py-1.5 font-display text-xs uppercase tracking-wide hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
                      >
                        {state.loading ? "Generating..." : "Generate reset link"}
                      </button>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <input
                            readOnly
                            value={state.url}
                            onFocus={(e) => e.target.select()}
                            className="w-full border border-ink bg-white px-2 py-1 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopy(u.id, state.url)}
                            className="shrink-0 border-2 border-ink px-2 py-1 font-display text-xs uppercase hover:bg-ink hover:text-paper transition-colors"
                          >
                            {state.copied ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <p className="text-xs text-muted mt-1">
                          Expires {new Date(state.expiresAt).toLocaleString()} · one-time use
                        </p>
                      </div>
                    )}
                    {state.error && <p className="text-xs text-red-600 mt-1">{state.error}</p>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}