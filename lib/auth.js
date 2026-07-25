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

module.exports = { createSessionCookie, clearSessionCookie, getSession, COOKIE_NAME };
