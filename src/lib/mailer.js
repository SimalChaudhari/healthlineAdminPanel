import nodemailer from 'nodemailer';

import { renderWelcomeEmail, renderPasswordResetOtpEmail } from './email-templates';

let transporter;

/** Reads MAIL_* keys, falling back to SMTP_* names. */
function smtpConfig() {
  const env = (...names) => names.map((n) => String(process.env[n] || '').trim()).find(Boolean) || '';
  const port = Number(env('MAIL_PORT', 'SMTP_PORT')) || 587;
  const secureRaw = env('MAIL_SECURE', 'SMTP_SECURE').toLowerCase();

  return {
    host: env('MAIL_HOST', 'SMTP_HOST'),
    port,
    secure: secureRaw ? secureRaw === 'true' : port === 465,
    user: env('MAIL_EMAIL', 'MAIL_USER', 'SMTP_USER'),
    // Gmail shows app passwords with spaces; SMTP needs them without.
    pass: env('MAIL_PASSWORD', 'SMTP_PASS').replace(/\s+/g, ''),
  };
}

function getTransporter() {
  if (transporter) return transporter;

  const { host, port, secure, user, pass } = smtpConfig();

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP is not configured. Set MAIL_HOST, MAIL_EMAIL and MAIL_PASSWORD (or SMTP_HOST, SMTP_USER, SMTP_PASS) in .env'
    );
  }

  transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

  return transporter;
}

export async function sendMail({ to, subject, text, html }) {
  const from = process.env.MAIL_FROM || `HealthLine <${smtpConfig().user}>`;
  return getTransporter().sendMail({ from, to, subject, text, html });
}

export async function sendPasswordResetOtp({ to, name, otp, minutes }) {
  const greeting = name ? `Hi ${name},` : 'Hi,';

  return sendMail({
    to,
    subject: `Your HealthLine password reset code`,
    text: `${greeting}\n\nYour password reset code is ${otp}.\nIt expires in ${minutes} minutes.\n\nIf you did not ask to reset your password, you can ignore this email.\n\n— HealthLine`,
    html: renderPasswordResetOtpEmail({ name, otp, minutes }),
  });
}

/**
 * Sent after an account is created — by the user in the app, or by an admin.
 * Never includes the password.
 */
export async function sendWelcomeEmail({ to, name, createdByAdmin = false }) {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const intro = createdByAdmin
    ? 'A HealthLine account has been created for you.'
    : 'Your HealthLine registration is complete.';
  const signInNote = createdByAdmin
    ? 'Sign in with the password your admin shared with you. You can change it any time with “Forgot password” on the sign-in screen.'
    : 'You can now sign in to the app and start tracking your meals, water and progress.';

  return sendMail({
    to,
    subject: createdByAdmin
      ? 'Your HealthLine account has been created'
      : 'Welcome to HealthLine — your registration is complete 🎉',
    text: `${greeting}\n\n${intro}\n\nAccount email: ${to}\n\n${signInNote}\n\nIf you did not create this account, please reply to this email.\n\n— HealthLine`,
    html: renderWelcomeEmail({ name, email: to, createdByAdmin }),
  });
}

/** Fire-and-forget welcome email — a mail failure must never block account creation. */
export function queueWelcomeEmail(user, options = {}) {
  sendWelcomeEmail({
    to: user.email,
    name: user.firstName || user.displayName,
    ...options,
  }).catch((error) => console.error('Welcome email failed:', error));
}
