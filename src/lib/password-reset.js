import crypto from 'crypto';

export const OTP_LENGTH = 6;
export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_SECONDS = 60;
export const RESET_TOKEN_TTL_MINUTES = 15;

export function generateOtp() {
  return String(crypto.randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/** OTP / token are short-lived, so HMAC with the JWT secret is enough (and fast). */
export function hashSecret(value) {
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'healthline')
    .update(String(value))
    .digest('hex');
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}
