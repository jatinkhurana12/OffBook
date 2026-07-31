import ContactForm from "../../components/ContactForm";

export const metadata = {
  title: "About OffBook — built for the skills economy",
  description:
    "Why OffBook exists: degrees are getting more expensive and less predictive of employability. We're building the place where skills, portfolios, and real problems matter more than transcripts.",
};

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-5 pt-20 pb-16 animate-fade-up">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-pen mb-4 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-pen shadow-glow-pen animate-pulse" />
          About OffBook
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.1] mb-6 text-ink">
          The degree isn&apos;t the credential anymore.
          <br />
          <span className="text-glow-gradient">The work is.</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl">
          OffBook is a community for people who&apos;d rather build a portfolio than
          collect a diploma — a place to turn the problems you&apos;ve actually lived
          through into businesses, teams, and careers.
        </p>
      </section>

      {/* The thesis */}
      <section className="border-t border-line/80">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <h2 className="font-display text-2xl font-bold text-ink mb-6">Why we exist</h2>
          <div className="space-y-5 text-muted leading-relaxed">
            <p>
              Formal education used to be the safest bet you could make. That bet is
              looking shakier every year. Across markets, graduates and postgraduates
              are showing up in unemployment data at higher rates than people who
              stopped at high school — the credential is growing, but the guarantee
              attached to it is shrinking.
            </p>
            <p>
              At the same time, the cost of a degree keeps climbing, and it&apos;s
              climbing faster than wages, faster than inflation, faster than almost
              anything else a young person is expected to pay for. The math that used
              to justify four (or six, or eight) years of tuition doesn&apos;t hold the
              way it once did.
            </p>
            <p>
              We think the response to that isn&apos;t to abandon learning — it&apos;s
              to change what counts as proof of it. The next generation of builders will
              be judged less by which institution accepted them and more by what
              they&apos;ve actually shipped: skills, portfolios, and problems solved in
              public.
            </p>
            <p className="text-ink font-medium">
              OffBook is built for that shift. No other platform is built specifically
              for this — we intend to be the place that gets there first.
            </p>
          </div>
        </div>
      </section>

      {/* What you can do here */}
      <section className="border-t border-line/80">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <h2 className="font-display text-2xl font-bold text-ink mb-8">What OffBook is for</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              label="01"
              title="Post the real problem"
              body="Share a problem you've actually lived through — not a pitch deck. Real friction is where real businesses start."
              accent="cobalt"
            />
            <Card
              label="02"
              title="Turn it into an idea"
              body="Work through it with people who've felt the same pain, and shape it into something worth building."
              accent="pen"
            />
            <Card
              label="03"
              title="Find collaborators"
              body="Match with like-minded people by skill and conviction, not by résumé. Build the team the old way couldn't give you."
              accent="sage"
            />
            <Card
              label="04"
              title="Hire or get hired on skill"
              body="Post internships and hire on portfolio and proof of work — never on degree. Or apply as an intern and let your work speak first."
              accent="mustard"
            />
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-t border-line/80">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <h2 className="font-display text-2xl font-bold text-ink mb-6">Who this is for</h2>
          <p className="text-muted leading-relaxed max-w-2xl">
            OffBook is a community of ambitious people — students, dropouts, self-taught
            builders, early founders, and anyone who&apos;d rather spend the next year
            building something real than adding another line to a transcript. If
            you&apos;re preparing yourself for a future that runs on skills and proof of
            work instead of paper, this is the room.
          </p>
        </div>
      </section>

      {/* Contact Us */}
      <section className="border-t border-line/80">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink mb-4">Contact us</h2>
              <p className="text-muted leading-relaxed">
                Questions, feedback, partnership ideas, or just want to say hi? Drop
                your details and message below and we&apos;ll get back to you by email.
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({ label, title, body, accent }) {
  const accentClass =
    accent === "pen"
      ? "text-pen"
      : accent === "sage"
      ? "text-sage"
      : accent === "mustard"
      ? "text-mustard"
      : "text-cobalt";
  return (
    <div className="glass p-6 hover-glow">
      <div className={`font-display text-xs mb-3 ${accentClass}`}>{label}.</div>
      <h3 className="font-display font-semibold text-lg mb-2 text-ink">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{body}</p>
    </div>
  );
}