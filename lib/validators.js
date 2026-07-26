const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

function validatePassword(password) {
  const errors = [];

  if (password.length < 9 || password.length > 12) {
    errors.push("Must be between 9 and 12 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Must include at least one capital letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Must include at least one number");
  }
  if (!SPECIAL_CHAR_REGEX.test(password)) {
    errors.push("Must include at least one special character");
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validatePassword };