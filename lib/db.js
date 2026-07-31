const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local (see .env.example) — you'll get this connection string from Neon, Supabase, or your own Postgres instance."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("sslmode=disable")
    ? false
    : { rejectUnauthorized: false },
});

let schemaReady = null;

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS profiles (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        headline TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        left_because TEXT DEFAULT '',
        skills TEXT DEFAULT '',
        looking_for TEXT DEFAULT '',
        availability TEXT DEFAULT 'exploring',
        links TEXT DEFAULT '',
        shipped TEXT DEFAULT '',
        avatar_url TEXT DEFAULT ''
      );

      -- Migration for databases created before avatar_url existed.
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';

      -- Migration for the Trailblazers feature. A trailblazer is any user
      -- who teaches a skill or concept via video lectures or articles;
      -- niche is the short label shown on their Trailblazer card (e.g.
      -- "React performance", "Public speaking").
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_trailblazer BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS niche TEXT DEFAULT '';

      CREATE TABLE IF NOT EXISTS problems (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        domain TEXT DEFAULT 'other',
        severity TEXT DEFAULT 'annoying',
        description TEXT NOT NULL,
        seeking TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Deliberately no "degree required" / "education level" column anywhere here.
      -- Filtering is by skill and pay only, by design.
      CREATE TABLE IF NOT EXISTS internships (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_title TEXT NOT NULL,
        organization TEXT NOT NULL,
        description TEXT NOT NULL,
        skills TEXT DEFAULT '',
        paid BOOLEAN DEFAULT FALSE,
        payment_amount NUMERIC,
        payment_period TEXT DEFAULT '',
        location TEXT DEFAULT 'remote',
        apply_instructions TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- One row per (problem, user) — a user can only have one active vote
      -- per problem at a time. vote_type is 1 for upvote, -1 for downvote.
      CREATE TABLE IF NOT EXISTS problem_votes (
        id SERIAL PRIMARY KEY,
        problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vote_type SMALLINT NOT NULL CHECK (vote_type IN (1, -1)),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(problem_id, user_id)
      );

      -- Single-use, short-lived tokens for "forgot password" flow. Only the
      -- SHA-256 hash of the token is stored (see lib/passwordReset.js) — the
      -- raw token that goes in the email link is never persisted.
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- "Follows" — who follows whom. follower_id follows followed_id.
      -- A user can't follow the same person twice (UNIQUE), and the CHECK
      -- stops anyone from following themselves.
      CREATE TABLE IF NOT EXISTS follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        followed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(follower_id, followed_id),
        CHECK (follower_id <> followed_id)
      ); 

      -- Direct messages between two members. No "conversation" table —
      -- a thread between two users is just every row where they're the
      -- sender/recipient pair, in either direction.
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        read_at TIMESTAMPTZ,
        deleted_by_sender BOOLEAN NOT NULL DEFAULT FALSE,
        deleted_by_recipient BOOLEAN NOT NULL DEFAULT FALSE,
        CHECK (sender_id <> recipient_id)
      );

     -- Migration for databases created before per-user message deletion existed.
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by_sender BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by_recipient BOOLEAN NOT NULL DEFAULT FALSE;

      -- Migration for shared media (image/audio/video) attachments. The file
      -- itself lives in Vercel Blob storage (see lib/blob.js) — only the
      -- resulting public URL and some display metadata are stored here.
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type TEXT;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_name TEXT;

      -- Browser push subscriptions (Web Push API). One row per device/browser
      -- a user has granted notification permission on. "endpoint" is unique
      -- per browser install, so it doubles as the natural key for upserts.
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        endpoint TEXT UNIQUE NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

-- Messages submitted through the public "Contact Us" form on the
      -- About OffBook page. No login required to submit one.
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT DEFAULT '',
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_profiles_trailblazer ON profiles(is_trailblazer) WHERE is_trailblazer = TRUE;
      CREATE INDEX IF NOT EXISTS idx_problems_domain ON problems(domain);
      CREATE INDEX IF NOT EXISTS idx_comments_problem_id ON comments(problem_id);
      CREATE INDEX IF NOT EXISTS idx_internships_paid ON internships(paid);
      CREATE INDEX IF NOT EXISTS idx_internships_created ON internships(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_problem_votes_problem ON problem_votes(problem_id);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
      CREATE INDEX IF NOT EXISTS idx_follows_followed ON follows(followed_id);
      CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, read_at);
      CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id, recipient_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `);
  }
  return schemaReady;
}

// Every caller goes through this so the schema is guaranteed to exist
// before any query runs, without each route remembering to await it.
async function query(text, params) {
  await ensureSchema();
  return pool.query(text, params);
}

module.exports = { query, pool };