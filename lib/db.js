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

      CREATE INDEX IF NOT EXISTS idx_problems_domain ON problems(domain);
      CREATE INDEX IF NOT EXISTS idx_comments_problem_id ON comments(problem_id);
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
