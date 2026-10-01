/**
 * Password policy — mirrors the Healthline APK (`healthline/src/utils/validation.js`).
 * Shared by the admin forms (client) and the API routes (server).
 */

export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 64;

/** Rules shown as a live checklist under the password field. */
export function passwordRules(password) {
  const p = String(password || '');
  return [
    { id: 'length', label: `At least ${PASSWORD_MIN} characters`, ok: p.length >= PASSWORD_MIN },
    { id: 'lower', label: 'One lowercase letter (a–z)', ok: /[a-z]/.test(p) },
    { id: 'upper', label: 'One capital letter (A–Z)', ok: /[A-Z]/.test(p) },
    { id: 'number', label: 'One number (0–9)', ok: /\d/.test(p) },
    { id: 'special', label: 'One special character (!@#…)', ok: /[^A-Za-z0-9]/.test(p) },
  ];
}

/** Strength 0–5 = how many checklist rules pass. */
export function passwordStrength(password) {
  return passwordRules(password).filter((r) => r.ok).length;
}

export function passwordStrengthLabel(score) {
  if (score <= 0) return '';
  if (score <= 1) return 'Very weak';
  if (score === 2) return 'Weak';
  if (score === 3) return 'Fair';
  if (score === 4) return 'Strong';
  return 'Very strong';
}

export function passwordStrengthColor(score) {
  if (score <= 1) return '#FF3B30';
  if (score === 2) return '#FF9500';
  if (score === 3) return '#FFCC00';
  if (score === 4) return '#34C759';
  return '#00B67A';
}

/** Returns '' when valid, otherwise a message listing what is missing. */
export function validatePassword(password) {
  const p = String(password || '');
  if (!p) return 'Password is required.';
  if (p.length > PASSWORD_MAX) {
    return `Password must be at most ${PASSWORD_MAX} characters.`;
  }
  const failed = passwordRules(p).filter((r) => !r.ok);
  if (failed.length) {
    return `Add: ${failed.map((r) => r.label.replace(/^One /, '').replace(/^At least /, '')).join(', ')}.`;
  }
  return '';
}
