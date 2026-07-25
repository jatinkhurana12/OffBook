# Offbook

A community platform for ambitious high school and college dropouts — people who left
because of cost or irrelevance, not ability — to post real problems they've lived
through, find collaborators, and build a track record without a degree.

## What's in this MVP

- **Auth** — email/password signup and login (bcrypt + JWT session cookie)
- **Problem board** — post a problem you personally hit (domain, severity, description,
  who you're hoping finds it), browse/filter by domain, comment/discuss on any post
- **Directory** — every member has a profile (why they left, skills, what they're
  looking for, availability, what they've shipped); filter by skill to find collaborators
- **Profile** — editable "build log" that stands in for a transcript
- **Storage** — PostgreSQL (works with any hosted Postgres — Neon, Supabase, Railway,
  or your own instance)

This is intentionally a thin but complete slice: real auth, a real database, and the
three loops from the brief (share a problem → get replies → find someone to build
with). It's meant to be a foundation to extend, not a finished product.

## Running it locally

You'll need Node.js 18+ installed, plus a Postgres database. The easiest way to get
one for free:

1. Sign up at **[neon.tech](https://neon.tech)** or **[supabase.com](https://supabase.com)**
2. Create a new project — takes about 2 minutes
3. Copy the connection string it gives you (looks like
   `postgresql://user:pass@host/dbname?sslmode=require`)

Then:

```bash
cp .env.example .env.local
# open .env.local and paste your connection string into DATABASE_URL

npm install
npm run seed     # optional: adds 3 sample users + 3 sample problems
npm run dev
```

Then open **http://localhost:3000**.

The database tables are created automatically the first time the app queries the
database — no separate migration step needed.

Seeded accounts (if you ran `npm run seed`), all with password `password123`:
- maya@example.com
- jordan@example.com
- priya@example.com

To reset the database, delete `data/offbook.sqlite*` and re-run `npm run seed`.

## Project structure

```
app/
  page.js                  landing page
  login/, signup/          auth pages
  dashboard/                problem feed (filterable by domain)
  problems/new/             post a problem
  problems/[id]/            problem detail + comments
  members/                  collaborator directory (filterable by skill)
  profile/                  edit your own build-log profile
  api/                      route handlers (auth, problems, comments, members, profile)
lib/
  db.js                     SQLite connection + schema (auto-creates tables)
  auth.js                   session cookie helpers (JWT)
  seed.js                   sample data
middleware.js                route protection for logged-in-only pages
```

## Deploying

Now that it's on Postgres, this can deploy anywhere that runs Node — including
serverless platforms. **Vercel** (built by the Next.js team) is the easiest:

1. Push this folder to a GitHub repo
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add `DATABASE_URL` and `SESSION_SECRET` as environment variables in Vercel's
   project settings (same values as your `.env.local`)
4. Deploy — you get a live URL immediately

For `SESSION_SECRET` in production, generate a real random value rather than reusing
a dev one:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Where to take it next

Ideas from the original design discussion that aren't built yet, roughly in order of
likely impact:

1. **Small accountability pods** — auto-group 4-6 members at a similar stage instead of
   relying only on the open directory
2. **Capital-shortage resource hub** — curated grants/fellowships for non-degree
   founders, low-cost tool lists, investors known to back dropouts
3. **Structured collaborator matching** — instead of a plain skill filter, a
   "what you bring / what you need" two-sided match with mutual opt-in
4. **Direct messaging** between members (currently all discussion is public, on-thread)
5. **Public build logs** — let shipped-work entries link out to live projects,
   turning the profile into more of a portfolio
6. **Moderation tools** — report/flag, since an open community will need this at scale
