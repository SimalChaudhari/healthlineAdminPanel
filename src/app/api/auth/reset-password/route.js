import bcrypt from 'bcryptjs';

import { connectDB } from 'src/lib/mongodb';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { validatePassword } from 'src/utils/password-rules';
import { hashSecret, normalizeEmail, safeEqual } from 'src/lib/password-reset';
import { User } from 'src/models/user';
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
    const resetToken = String(body.resetToken || '');
    const password = String(body.password || '');

    if (!email || !resetToken) {
      return errorResponse('Reset session is missing. Please start again.', 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return errorResponse(passwordError, 400);
    }

    await connectDB();

    const record = await PasswordReset.findOne({ email });
    const valid =
      record &&
      record.resetTokenHash &&
      record.resetTokenExpiresAt &&
      record.resetTokenExpiresAt.getTime() > Date.now() &&
      safeEqual(hashSecret(resetToken), record.resetTokenHash);

    if (!valid) {
      return errorResponse('Reset session has expired. Please request a new code.', 400);
    }

    const user = await User.findOne({ email });
    if (!user || user.status === 'Blocked') {
      await PasswordReset.deleteOne({ email });
      return errorResponse('Unable to reset password for this account', 403);
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    await PasswordReset.deleteOne({ email });

    return json({ message: 'Password updated. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('Unable to reset password', 500);
  }
}
