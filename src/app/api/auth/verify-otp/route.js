import { connectDB } from 'src/lib/mongodb';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import {
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  RESET_TOKEN_TTL_MINUTES,
  generateResetToken,
  hashSecret,
  normalizeEmail,
  safeEqual,
} from 'src/lib/password-reset';
import { PasswordReset } from 'src/models/password-reset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);
    const otp = String(body.otp || '').trim();

    if (!email || !new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp)) {
      return errorResponse(`Enter the ${OTP_LENGTH}-digit code`, 400);
    }

    await connectDB();

    const record = await PasswordReset.findOne({ email });
    if (!record || record.otpExpiresAt.getTime() < Date.now()) {
      return errorResponse('This code has expired. Please request a new one.', 400);
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      return errorResponse('Too many wrong attempts. Please request a new code.', 429);
    }

    if (!safeEqual(hashSecret(otp), record.otpHash)) {
      record.attempts += 1;
      await record.save();
      const left = OTP_MAX_ATTEMPTS - record.attempts;
      return errorResponse(
        left > 0
          ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.`
          : 'Too many wrong attempts. Please request a new code.',
        400
      );
    }

    const resetToken = generateResetToken();
    record.resetTokenHash = hashSecret(resetToken);
    record.resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
    // OTP is single-use: expire it now that it has been exchanged for a reset token.
    record.otpExpiresAt = new Date(0);
    await record.save();

    return json({ resetToken, expiresInMinutes: RESET_TOKEN_TTL_MINUTES });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return errorResponse('Unable to verify code', 500);
  }
}
