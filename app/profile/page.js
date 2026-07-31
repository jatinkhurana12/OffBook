"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AVAILABILITY = ["exploring", "open-to-cofound", "already-building"];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB, before base64 encoding

export default function Profile() {
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState("");
  const [nameError, setNameError] = useState("");
  const [deleting, setDeleting] = useState(false);

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
  setNameError("");

  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    setNameError(data.error || "Something went wrong saving your profile.");
    return;
  }

  setSaved(true);
  setTimeout(() => setSaved(false), 2500);
  router.refresh();
}
  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image is too large. Please choose one under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, avatar_url: reader.result }));
    };
    reader.onerror = () => setAvatarError("Couldn't read that file. Try a different image.");
    reader.readAsDataURL(file);
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Delete your account? This permanently removes your profile, problems, comments, votes, and internship posts. This can't be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    const res = await fetch("/api/profile", { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setDeleting(false);
      alert("Something went wrong deleting your account. Please try again.");
    }
  }

  if (loading || !form) return <div className="max-w-2xl mx-auto px-5 py-12 text-muted text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-display text-2xl font-bold mb-1">{form.name}&apos;s profile</h1>
      <p className="text-muted text-sm mb-8">This is your build log — what you bring and what you've shipped.</p>

      <form onSubmit={handleSave} className="space-y-6">
        <Field label="Name">
  <input
    value={form.name || ""}
    onChange={(e) => setForm({ ...form, name: e.target.value })}
    placeholder="Your name"
    maxLength={80}
    className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
  />
  {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
</Field>
        <Field label="Profile picture">
          <div className="flex items-center gap-4">
 {form.avatar_url ? (
               <img
                 src={form.avatar_url}
                 alt="Your profile picture"
                className="w-20 h-20 rounded-full object-cover border-2 border-ink"
               />
             ) : (
              <div className="w-20 h-20 rounded-full border-2 border-ink bg-panel flex items-center justify-center text-muted text-xs">
                 No photo
               </div>
             )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-sm"
              />
              {form.avatar_url && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, avatar_url: "" })}
                  className="block mt-2 text-xs text-muted underline hover:text-pen"
                >
                  Remove photo
                </button>
              )}
              {avatarError && <p className="text-xs text-red-600 mt-1">{avatarError}</p>}
            </div>
          </div>
        </Field>

        <Field label="Headline">
          <input
            value={form.headline || ""}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            placeholder="e.g. Self-taught backend dev, ex-community college"
            className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
          />
        </Field>

        <Field label="Trailblazer">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.is_trailblazer}
              onChange={(e) => setForm({ ...form, is_trailblazer: e.target.checked })}
              className="w-4 h-4 accent-ink"
            />
            I teach a skill or concept through video lectures or articles — list me as a Trailblazer
          </label>
        </Field>

        {form.is_trailblazer && (
          <Field label="Niche">
            <input
              value={form.niche || ""}
              onChange={(e) => setForm({ ...form, niche: e.target.value })}
              placeholder="e.g. React performance, UI design, public speaking"
              maxLength={120}
              className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen"
            />
          </Field>
        )}

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

      <div className="mt-16 border-t-2 border-line pt-8">
        <h2 className="font-display text-sm uppercase tracking-widest text-muted mb-2">
          Danger zone
        </h2>
        <p className="text-sm text-muted mb-4">
          Deleting your account removes your profile, problems, comments, votes, and internship
          posts. This can&apos;t be undone.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="border-2 border-red-600 text-red-600 px-6 py-3 font-display text-sm uppercase tracking-wider hover:bg-red-600 hover:text-paper transition-colors disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete account"}
        </button>
      </div>
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