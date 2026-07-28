"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import VoteButtons from "../../../components/VoteButtons";
import Avatar from "../../../components/Avatar";

export default function ProblemDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState(null);
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [myUserId, setMyUserId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/problems/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProblem(data.problem);
        setComments(data.comments || []);
      });
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => setMyUserId(data.session ? data.session.id : null));
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

  async function handleDeleteProblem() {
    if (!window.confirm("Delete this problem? This can't be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/problems/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Couldn't delete this.");
    }
  }

  if (!problem) return <div className="max-w-2xl mx-auto px-5 py-12 text-muted text-sm">Loading...</div>;

  const isOwner = myUserId !== null && myUserId === problem.author_id;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <div className="border-2 border-ink bg-panel p-6 mb-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="font-display text-xs uppercase bg-ink text-paper px-2 py-1">{problem.domain}</span>
            <span className="font-display text-xs uppercase text-pen">{problem.severity}</span>
          </div>
          {isOwner && (
            <div className="flex items-center gap-3 text-xs font-display uppercase tracking-wide">
              <Link href={`/problems/${id}/edit`} className="text-muted hover:text-ink">
                Edit
              </Link>
              <button
                onClick={handleDeleteProblem}
                disabled={deleting}
                className="text-muted hover:text-pen disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
        <h1 className="font-display text-2xl font-bold mb-3 leading-snug">{problem.title}</h1>
        <p className="text-ink leading-relaxed whitespace-pre-wrap mb-4">{problem.description}</p>
        {problem.seeking && (
          <p className="text-sm border-l-2 border-pen pl-3 text-muted">
            Looking for: {problem.seeking}
          </p>
        )}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-line">
          <p className="flex items-center gap-2 text-xs text-muted font-medium">
            <Avatar src={problem.author_avatar_url} name={problem.author_name} size="xs" />
             Posted by {problem.author_name} · {new Date(problem.created_at).toLocaleDateString()}
           </p>
           <VoteButtons
            problemId={problem.id}
            initialUpvotes={problem.upvotes}
            initialDownvotes={problem.downvotes}
            initialMyVote={problem.my_vote}
            size="lg"
          />
        </div>
      </div>

      <h2 className="font-display text-sm uppercase tracking-widest text-muted mb-4">
        Replies ({comments.length})
      </h2>

      <ul className="space-y-4 mb-8">
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            problemId={id}
            isOwner={myUserId !== null && myUserId === c.user_id}
            onUpdated={setComments}
          />
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

function CommentItem({ comment, problemId, isOwner, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!draft.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/problems/${problemId}/comments/${comment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Couldn't save that.");
      return;
    }
    onUpdated(data.comments);
    setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this reply?")) return;
    const res = await fetch(`/api/problems/${problemId}/comments/${comment.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const data = await res.json();
      onUpdated(data.comments);
    }
  }

  return (
    <li className="border-l-2 border-line pl-4">
      {editing ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full border-2 border-ink bg-panel px-3 py-2 text-sm focus:outline-none focus:border-pen"
          />
          {error && <p className="text-pen text-xs font-medium">{error}</p>}
          <div className="flex gap-3 text-xs font-display uppercase tracking-wide">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sage hover:opacity-70 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setDraft(comment.body);
                setEditing(false);
                setError("");
              }}
              className="text-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
 <p className="text-sm leading-relaxed">{comment.body}</p>
           <div className="flex items-center gap-3 mt-1">
             <p className="flex items-center gap-2 text-xs text-muted font-medium">
               <Avatar src={comment.author_avatar_url} name={comment.author_name} size="xs" />
               {comment.author_name} · {new Date(comment.created_at).toLocaleDateString()}
             </p>
            {isOwner && (
              <div className="flex items-center gap-2 text-xs font-display uppercase tracking-wide">
                <button onClick={() => setEditing(true)} className="text-muted hover:text-ink">
                  Edit
                </button>
                <button onClick={handleDelete} className="text-muted hover:text-pen">
                  Delete
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </li>
  );
}