import { connectDB } from 'src/lib/mongodb';
import { sendPasswordResetOtp } from 'src/lib/mailer';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import {
  OTP_TTL_MINUTES,
  OTP_RESEND_SECONDS,
  generateOtp,
  hashSecret,
  normalizeEmail,
} from 'src/lib/password-reset';
import { User } from 'src/models/user';
import { PasswordReset } from 'src/models/password-reset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

/** Same reply whether or not the account exists, so emails can't be probed. */
const GENERIC_REPLY = {
  message: 'If an account exists for this email, a 6-digit code has been sent.',
  expiresInMinutes: OTP_TTL_MINUTES,
  resendInSeconds: OTP_RESEND_SECONDS,
};

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);

    if (!email || !email.includes('@')) {
      return errorResponse('A valid email is required', 400);
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user || user.status === 'Blocked') {
      return json(GENERIC_REPLY);
    }

    const existing = await PasswordReset.findOne({ email });
    if (existing) {
      const waitMs = existing.lastSentAt.getTime() + OTP_RESEND_SECONDS * 1000 - Date.now();
      if (waitMs > 0) {
        const seconds = Math.ceil(waitMs / 1000);
        return errorResponse(`Please wait ${seconds}s before requesting a new code`, 429);
      }
    }

    const otp = generateOtp();
    const now = new Date();
    const otpExpiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

    await PasswordReset.findOneAndUpdate(
      { email },
      {
        email,
        otpHash: hashSecret(otp),
        otpExpiresAt,
        attempts: 0,
        lastSentAt: now,
        resetTokenHash: '',
        resetTokenExpiresAt: null,
        expireAt: new Date(now.getTime() + 60 * 60 * 1000),
      },
      { upsert: true, setDefaultsOnInsert: true }
    );

    try {
      await sendPasswordResetOtp({
        to: email,
        name: user.firstName || user.displayName,
        otp,
        minutes: OTP_TTL_MINUTES,
      });
    } catch (mailError) {
      console.error('Reset OTP email failed:', mailError);
      await PasswordReset.deleteOne({ email });
      return errorResponse('Unable to send the email right now. Please try again later.', 502);
    }

    return json(GENERIC_REPLY);
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('Unable to process request', 500);
  }
}
