import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-pen mb-4">
            For the ones who left early
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.1] mb-6">
            You didn&apos;t finish the program.
            <br />
            You started the company.
          </h1>
          <p className="text-lg text-muted mb-8 max-w-md">
            Offbook is where dropouts trade the problems they actually lived through,
            find people to build with, and prove their work without a transcript.
          </p>
          <div className="flex gap-4">
            <Link
              href="/signup"
              className="bg-ink text-paper px-6 py-3 font-display text-sm uppercase tracking-wider hover:bg-pen transition-colors"
            >
              Join the room
            </Link>
            <Link
              href="/dashboard"
              className="border-2 border-ink px-6 py-3 font-display text-sm uppercase tracking-wider hover:border-pen hover:text-pen transition-colors"
            >
              Browse problems
            </Link>
          </div>
        </div>

        {/* Signature element: a transcript with GPA struck out and replaced by shipped work */}
        <div className="bg-panel border-2 border-ink p-6 shadow-[6px_6px_0_0_#17181A] rotate-1">
          <div className="flex justify-between items-baseline border-b border-line pb-3 mb-4">
            <span className="font-display text-xs uppercase tracking-widest text-muted">
              Official Transcript
            </span>
            <span className="font-display text-xs text-muted">Rev. 2</span>
          </div>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span>Cumulative GPA</span>
              <span className="strike text-muted">3.41</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="strike text-muted">Enrolled</span>
            </div>
            <div className="border-t border-dashed border-line my-3"></div>
            <div className="flex justify-between font-semibold">
              <span>Shipped</span>
              <span>3 products, 1 acquired</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Revenue found</span>
              <span>$41,200</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Collaborators met</span>
              <span>7</span>
            </div>
          </div>
          <p className="font-display text-[11px] text-pen mt-5 uppercase tracking-wide">
            — graded on proof, not attendance
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="border-t-2 border-ink bg-panel">
        <div className="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-10">
          <Pillar
            label="A"
            title="Real problems, not pitches"
            body="Post the friction you actually lived through, tagged by domain and how badly it hurts. No pitch decks required."
          />
          <Pillar
            label="B"
            title="Collaborators, not cheerleaders"
            body="Filter people by what they bring and what they need. Match on complementary skills and shared conviction."
          />
          <Pillar
            label="C"
            title="A record that isn't a degree"
            body="Your profile is a build log — what you shipped, what problems you validated. That's the credential here."
          />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-16 text-center">
        <h2 className="font-display text-2xl font-bold mb-3">No transcript required.</h2>
        <p className="text-muted mb-8">Just the next problem you're willing to solve.</p>
        <Link
          href="/signup"
          className="inline-block bg-ink text-paper px-8 py-3 font-display text-sm uppercase tracking-wider hover:bg-pen transition-colors"
        >
          Create your profile
        </Link>
      </section>
    </div>
  );
}

function Pillar({ label, title, body }) {
  return (
    <div>
      <div className="font-display text-xs text-pen mb-2">{label}.</div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{body}</p>
    </div>
  );
}
