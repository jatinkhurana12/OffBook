import Link from "next/link";
import { getSession } from "../lib/auth";
import ScrollReveal from "../components/ScrollReveal";

export default function Home() {
  const session = getSession();
  return (
    <div>
      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-5 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center overflow-hidden">
        {/* Ambient floating gradient orbs — purely decorative */}
        <div className="orb w-72 h-72 bg-cobalt/25 -top-10 -left-24 animate-drift" />
        <div className="orb w-64 h-64 bg-pen/20 top-32 right-0 animate-float" />
        <div className="orb w-56 h-56 bg-sage/15 bottom-0 left-1/3 animate-glow-pulse" />

        <div className="relative z-10 animate-fade-up">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-pen mb-4 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-pen shadow-glow-pen animate-pulse" />
            For the ones who left early
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.1] mb-6 text-ink">
            You didn&apos;t finish the program.
            <br />
            <span className="text-glow-gradient">You started the company.</span>
          </h1>
          <p className="text-lg text-muted mb-8 max-w-md">
            Offbook is where dropouts trade the problems they actually lived through,
            find people to build with, and prove their work without a transcript.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/signup"
              className="bg-ink text-paper px-6 py-3 font-display text-sm uppercase tracking-wider hover:shadow-glow-sm hover:-translate-y-0.5 transition-all duration-300"
            >
              Join the room
            </Link>
            <Link
              href="/dashboard"
              className="border border-line px-6 py-3 font-display text-sm uppercase tracking-wider text-ink hover:border-cobalt hover:text-cobalt hover:shadow-glow-sm transition-all duration-300"
            >
              Browse problems
            </Link>
          </div>
        </div>

        {/* Signature element: a transcript with GPA struck out and replaced by shipped work */}
        <div className="relative z-10 glass shadow-panel p-6 animate-float card-shine">
          <div className="flex justify-between items-baseline border-b border-line pb-3 mb-4">
            <span className="font-display text-xs uppercase tracking-widest text-muted">
              Official Transcript
            </span>
            <span className="font-display text-xs text-muted">Rev. 2</span>
          </div>
          <div className="space-y-3 font-mono text-sm text-ink">
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
              <span className="text-sage">3 products, 1 acquired</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Revenue found</span>
              <span className="text-sage">$41,200</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Collaborators met</span>
              <span className="text-sage">7</span>
            </div>
          </div>
          <p className="font-display text-[11px] text-pen mt-5 uppercase tracking-wide">
            — graded on proof, not attendance
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="border-t border-line/80 relative">
        <div className="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-6">
          <ScrollReveal delay={0}>
            <Pillar
              label="A"
              title="Real problems, not pitches"
              body="Post the friction you actually lived through, tagged by domain and how badly it hurts. No pitch decks required."
              accent="cobalt"
            />
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <Pillar
              label="B"
              title="Collaborators, not cheerleaders"
              body="Filter people by what they bring and what they need. Match on complementary skills and shared conviction."
              accent="pen"
            />
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <Pillar
              label="C"
              title="A record that isn't a degree"
              body="Your profile is a build log — what you shipped, what problems you validated. That's the credential here."
              accent="sage"
            />
          </ScrollReveal>
        </div>
      </section>

      <ScrollReveal direction="scale" as="section" className="max-w-5xl mx-auto px-5 py-20 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 text-ink">
          No transcript required.
        </h2>
        <p className="text-muted mb-8">Just the next problem you&apos;re willing to solve.</p>
        {session ? (
          <Link
            href="/dashboard"
            className="inline-block bg-ink text-paper px-8 py-3 font-display text-sm uppercase tracking-wider hover:shadow-glow-sm hover:-translate-y-0.5 hover:scale-[1.03] transition-all duration-300"
          >
            Explore the problems
          </Link>
        ) : (
          <Link
            href="/signup"
            className="inline-block bg-ink text-paper px-8 py-3 font-display text-sm uppercase tracking-wider hover:shadow-glow-sm hover:-translate-y-0.5 hover:scale-[1.03] transition-all duration-300"
          >
            Create your profile
          </Link>
        )}
      </ScrollReveal>
    </div>
  );
}

function Pillar({ label, title, body, accent }) {
  const accentClass = accent === "pen" ? "text-pen" : accent === "sage" ? "text-sage" : "text-cobalt";
  return (
    <div className="glass p-6 hover-glow card-shine">
      <div className={`font-display text-xs mb-3 ${accentClass}`}>{label}.</div>
      <h3 className="font-display font-semibold text-lg mb-2 text-ink">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{body}</p>
    </div>
  );
}