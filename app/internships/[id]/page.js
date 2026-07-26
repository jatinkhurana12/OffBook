"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InternshipDetail() {
  const { id } = useParams();
  const [internship, setInternship] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/internships/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => setInternship(data.internship))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12 text-muted text-sm">
        This opening doesn&apos;t exist, or was taken down.
      </div>
    );
  }

  if (!internship) {
    return <div className="max-w-2xl mx-auto px-5 py-12 text-muted text-sm">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <div className="border-2 border-ink bg-panel p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="font-display text-2xl font-bold leading-snug">{internship.role_title}</h1>
            <p className="text-muted mt-1">{internship.organization}</p>
          </div>
          <PaymentBadge internship={internship} />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted font-medium mb-6">
          <span className="uppercase font-display">{internship.location}</span>
          <span>Posted by {internship.poster_name}</span>
          <span>{new Date(internship.created_at).toLocaleDateString()}</span>
        </div>

        <p className="text-ink leading-relaxed whitespace-pre-wrap mb-6">{internship.description}</p>

        {internship.skills && (
          <div className="mb-6">
            <h2 className="font-display text-xs uppercase tracking-widest text-muted mb-2">
              Skills needed
            </h2>
            <div className="flex flex-wrap gap-2">
              {internship.skills.split(",").map((s) => (
                <span
                  key={s}
                  className="border border-line px-2.5 py-1 text-xs font-medium"
                >
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t-2 border-line pt-5">
          <h2 className="font-display text-xs uppercase tracking-widest text-muted mb-2">
            How to apply
          </h2>
          <p className="text-sm font-medium break-words">{internship.apply_instructions}</p>
        </div>
      </div>
    </div>
  );
}

function PaymentBadge({ internship }) {
  if (!internship.paid) {
    return (
      <span className="font-display text-xs uppercase text-muted whitespace-nowrap border border-line px-2 py-1 shrink-0">
        Unpaid
      </span>
    );
  }
  return (
    <span className="font-display text-xs uppercase text-sage whitespace-nowrap border border-sage px-2 py-1 shrink-0">
      ${Number(internship.payment_amount).toLocaleString()}
      {internship.payment_period ? ` / ${internship.payment_period}` : ""}
    </span>
  );
}