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

module.exports = { createResetToken, buildResetUrl, TOKEN_TTL_MS };