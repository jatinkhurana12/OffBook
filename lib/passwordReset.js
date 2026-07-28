const crypto = require("crypto");
const { query } = require("./db");

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Creates a one-time, single-use reset token for a user. Only the SHA-256
// hash is stored in the DB — the raw token (needed to actually redeem it)
// is returned here and never persisted anywhere.
async function createResetToken(userId) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await query(
    "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, tokenHash, expiresAt]
  );

  return { rawToken, expiresAt };
}

function buildResetUrl(origin, rawToken) {
  return `${origin}/reset-password?token=${rawToken}`;
}

// Validates a raw token from a reset link: it must exist, be unexpired, and
// not have been used already. On success, marks it used (so it can't be
// replayed) and returns the associated user_id. Returns null on any failure
// — callers should treat every failure case identically ("invalid or
// expired link") to avoid leaking which part failed.
async function consumeResetToken(rawToken) {
  if (!rawToken) return null;
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const result = await query(
    `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     RETURNING user_id`,
    [tokenHash]
  );

  return result.rows[0]?.user_id || null;
}

module.exports = { createResetToken, consumeResetToken, buildResetUrl, TOKEN_TTL_MS };