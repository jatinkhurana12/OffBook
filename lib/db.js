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
        shipped TEXT DEFAULT ''
      );

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

      CREATE INDEX IF NOT EXISTS idx_problems_domain ON problems(domain);
      CREATE INDEX IF NOT EXISTS idx_comments_problem_id ON comments(problem_id);
      CREATE INDEX IF NOT EXISTS idx_internships_paid ON internships(paid);
      CREATE INDEX IF NOT EXISTS idx_internships_created ON internships(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_problem_votes_problem ON problem_votes(problem_id);
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
