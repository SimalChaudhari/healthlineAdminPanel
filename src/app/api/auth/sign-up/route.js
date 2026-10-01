import bcrypt from 'bcryptjs';

import { connectDB } from 'src/lib/mongodb';
import { signAccessToken } from 'src/lib/jwt';
import { queueWelcomeEmail } from 'src/lib/mailer';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { validatePassword } from 'src/utils/password-rules';
import { User, sanitizeHealthProfile } from 'src/models/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const password = String(body.password || '');
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const phoneNumber = String(body.phoneNumber || '').trim();

    if (!email || !email.includes('@')) {
      return errorResponse('A valid email is required', 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return errorResponse(passwordError, 400);
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return errorResponse('An account with this email already exists', 409);
    }

    const role = 'user'; // APK sign-up is always app user — never admin
    const displayName = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];
    // Always persist onboarding preferences (defaults if client omitted profile)
    const profile = sanitizeHealthProfile(body.profile || body.healthProfile || {});

    const user = await User.create({
      email,
      password: await bcrypt.hash(password, 10),
      firstName,
      lastName,
      displayName,
      phoneNumber,
      role,
      plan: 'Free',
      status: 'Active',
      profile,
    });

    const publicUser = user.toPublicJSON();
    queueWelcomeEmail(user);

    return json(
      {
        accessToken: signAccessToken(publicUser),
        user: publicUser,
      },
      201
    );
  } catch (error) {
    console.error('Sign-up error:', error);
    return errorResponse('Unable to create account', 500);
  }
}
