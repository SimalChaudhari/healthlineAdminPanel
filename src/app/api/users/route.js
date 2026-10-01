import bcrypt from 'bcryptjs';

import { connectDB } from 'src/lib/mongodb';
import { queueWelcomeEmail } from 'src/lib/mailer';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { validatePassword } from 'src/utils/password-rules';
import { User, sanitizeHealthProfile } from 'src/models/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const q = String(searchParams.get('q') || '').trim().toLowerCase();
    const status = String(searchParams.get('status') || '').trim();
    const plan = String(searchParams.get('plan') || '').trim();

    await connectDB();

    // Users table = app users only (never list admin accounts here)
    const filter = { role: 'user' };

    if (status && status !== 'all') filter.status = status;
    if (plan && plan !== 'all') filter.plan = plan;

    if (q) {
      filter.$or = [
        { email: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    return json({
      users: users.map((user) => user.toPublicJSON()),
      total: users.length,
    });
  } catch (error) {
    console.error('Users list error:', error);
    return errorResponse('Unable to load users', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const password = String(body.password || '');
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const phoneNumber = String(body.phoneNumber || '').trim();
    const role = body.role === 'admin' ? 'admin' : 'user';
    const plan = String(body.plan || 'Free').trim() || 'Free';

    const status = ['Active', 'Trial', 'Blocked'].includes(body.status) ? body.status : 'Active';

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

    const displayName =
      String(body.displayName || '').trim() ||
      [firstName, lastName].filter(Boolean).join(' ') ||
      email.split('@')[0];

    const user = await User.create({
      email,
      password: await bcrypt.hash(password, 10),
      firstName,
      lastName,
      displayName,
      phoneNumber,
      role,
      plan,
      status,
      photoURL: String(body.photoURL || '').trim(),
      photoPublicId: String(body.photoPublicId || '').trim(),
      // Onboarding profile only for app users
      ...(role === 'user'
        ? { profile: sanitizeHealthProfile(body.profile || {}) }
        : {}),
    });

    queueWelcomeEmail(user, { createdByAdmin: true });

    return json({ user: user.toPublicJSON() }, 201);
  } catch (error) {
    console.error('Create user error:', error);
    return errorResponse('Unable to create user', 500);
  }
}
