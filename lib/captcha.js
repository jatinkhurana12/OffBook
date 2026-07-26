const jwt = require("jsonwebtoken");

const SECRET = process.env.SESSION_SECRET || "offbook-dev-secret-change-me";

function generateCaptcha() {
  // Random 6-digit code, e.g. "482913". Always exactly 6 digits (padded if needed).
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const token = jwt.sign({ code }, SECRET, { expiresIn: "5m" });
  return { code, token };
}

function verifyCaptcha(token, submittedCode) {
  if (!token || !submittedCode) return false;
  try {
    const decoded = jwt.verify(token, SECRET);
    return String(submittedCode).trim() === decoded.code;
  } catch {
    return false;
  }
}

module.exports = { generateCaptcha, verifyCaptcha };