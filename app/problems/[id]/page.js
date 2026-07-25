"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/problems/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProblem(data.problem);
        setComments(data.comments || []);
      });
  }, [id]);

  async function handleComment(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setError("");
    setPosting(true);
    const res = await fetch(`/api/problems/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    setPosting(false);
    if (!res.ok) {
      setError(data.error || "Couldn't post that. Try logging in.");
      return;
    }
    setComments(data.comments);
    setBody("");
  }

  if (!problem) return <div className="max-w-2xl mx-auto px-5 py-12 text-muted text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <div className="border-2 border-ink bg-panel p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-display text-xs uppercase bg-ink text-paper px-2 py-1">{problem.domain}</span>
          <span className="font-display text-xs uppercase text-pen">{problem.severity}</span>
        </div>
        <h1 className="font-display text-2xl font-bold mb-3 leading-snug">{problem.title}</h1>
        <p className="text-ink leading-relaxed whitespace-pre-wrap mb-4">{problem.description}</p>
        {problem.seeking && (
          <p className="text-sm border-l-2 border-pen pl-3 text-muted">
            Looking for: {problem.seeking}
          </p>
        )}
        <p className="text-xs text-muted mt-4 font-medium">
          Posted by {problem.author_name} · {new Date(problem.created_at).toLocaleDateString()}
        </p>
      </div>

      <h2 className="font-display text-sm uppercase tracking-widest text-muted mb-4">
        Replies ({comments.length})
      </h2>

      <ul className="space-y-4 mb-8">
        {comments.map((c) => (
          <li key={c.id} className="border-l-2 border-line pl-4">
            <p className="text-sm leading-relaxed">{c.body}</p>
            <p className="text-xs text-muted mt-1 font-medium">
              {c.author_name} · {new Date(c.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
        {comments.length === 0 && (
          <p className="text-muted text-sm">No replies yet. Be the first to weigh in.</p>
        )}
      </ul>

      <form onSubmit={handleComment} className="space-y-3">
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add to the discussion, offer to collaborate, or share what you know..."
          className="w-full border-2 border-ink bg-panel px-4 py-2.5 focus:outline-none focus:border-pen text-sm"
        />
        {error && <p className="text-pen text-sm font-medium">{error}</p>}
        <button
          type="submit"
          disabled={posting}
          className="bg-ink text-paper px-5 py-2.5 font-display text-xs uppercase tracking-wider hover:bg-pen transition-colors disabled:opacity-50"
        >
          {posting ? "Posting..." : "Reply"}
        </button>
      </form>
    </div>
  );
}
