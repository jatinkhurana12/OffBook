const jwt = require("jsonwebtoken");
const { cookies } = require("next/headers");

const SECRET = process.env.SESSION_SECRET || "offbook-dev-secret-change-me";
const COOKIE_NAME = "offbook_session";

function createSessionCookie(user) {
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET, {
    expiresIn: "30d",
  });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// Admins are configured via the ADMIN_EMAILS env var (comma-separated),
// not a DB flag — this avoids needing an existing admin to grant the first
// one. Set it in .env.local for dev and in Vercel's Environment Variables
// for production.
function isAdmin(session) {
  if (!session?.email) return false;
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(session.email.toLowerCase());
}

module.exports = { createSessionCookie, clearSessionCookie, getSession, isAdmin, COOKIE_NAME };