import bcrypt from 'bcryptjs';

import { connectDB } from 'src/lib/mongodb';
import { signAccessToken } from 'src/lib/jwt';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { User } from 'src/models/user';

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

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    await connectDB();

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse('Please check your email and password', 401);
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return errorResponse('Please check your email and password', 401);
    }

    const publicUser = user.toPublicJSON();

    if (publicUser.status === 'Blocked') {
      return errorResponse('This account has been blocked', 403);
    }

    if (body.adminOnly && publicUser.role !== 'admin') {
      return errorResponse('This account cannot access the admin panel', 403);
    }

    return json({
      accessToken: signAccessToken(publicUser),
      user: publicUser,
    });
  } catch (error) {
    console.error('Sign-in error:', error);
    return errorResponse('Unable to sign in', 500);
  }
}
