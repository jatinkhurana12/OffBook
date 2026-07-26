const jwt = require("jsonwebtoken");

const SECRET = process.env.SESSION_SECRET || "offbook-dev-secret-change-me";

function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const token = jwt.sign({ answer: a + b }, SECRET, { expiresIn: "5m" });
  return { question: `${a} + ${b}`, token };
}

function verifyCaptcha(token, submittedAnswer) {
  if (!token || submittedAnswer === undefined || submittedAnswer === null || submittedAnswer === "") {
    return false;
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    return Number(submittedAnswer) === decoded.answer;
  } catch {
    return false;
  }
}

module.exports = { generateCaptcha, verifyCaptcha };