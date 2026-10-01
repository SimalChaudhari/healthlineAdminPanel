import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { connectDB } from 'src/lib/mongodb';
import { requireAdmin } from 'src/lib/require-admin';
import { deleteImage, publicIdFromUrl } from 'src/lib/cloudinary';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { validatePassword } from 'src/utils/password-rules';
import { User, sanitizeHealthProfile } from 'src/models/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) {
      return errorResponse('User not found', 404);
    }

    await connectDB();

    const user = await User.findById(params.id);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return json({ user: user.toPublicJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Unable to load user', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) {
      return errorResponse('User not found', 404);
    }

    const body = await request.json();
    await connectDB();

    const user = await User.findById(params.id).select('+password');
    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (body.email) {
      const email = String(body.email).trim().toLowerCase();
      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        return errorResponse('An account with this email already exists', 409);
      }
      user.email = email;
    }

    if (body.firstName !== undefined) user.firstName = String(body.firstName || '').trim();
    if (body.lastName !== undefined) user.lastName = String(body.lastName || '').trim();
    if (body.phoneNumber !== undefined) user.phoneNumber = String(body.phoneNumber || '').trim();
    if (body.role === 'admin' || body.role === 'user') user.role = body.role;
    if (body.plan !== undefined) user.plan = String(body.plan || 'Free').trim() || 'Free';

    if (['Active', 'Trial', 'Blocked'].includes(body.status)) user.status = body.status;

    if (body.displayName !== undefined) {
      user.displayName = String(body.displayName || '').trim();
    } else {
      user.displayName =
        [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email.split('@')[0];
    }

    if (body.photoURL !== undefined) {
      const nextUrl = String(body.photoURL || '').trim();
      const nextPublicId = String(body.photoPublicId || publicIdFromUrl(nextUrl) || '').trim();
      const prevPublicId = user.photoPublicId || publicIdFromUrl(user.photoURL) || '';

      if (nextUrl !== user.photoURL) {
        if (prevPublicId && prevPublicId !== nextPublicId) {
          await deleteImage(prevPublicId);
        }
        user.photoURL = nextUrl;
        user.photoPublicId = nextPublicId;
      } else if (nextPublicId && !user.photoPublicId) {
        user.photoPublicId = nextPublicId;
      }
    } else if (body.photoPublicId !== undefined) {
      user.photoPublicId = String(body.photoPublicId || '').trim();
    }

    if (body.password) {
      const passwordError = validatePassword(body.password);
      if (passwordError) {
        return errorResponse(passwordError, 400);
      }
      user.password = await bcrypt.hash(String(body.password), 10);
    }

    if (body.profile !== undefined && user.role === 'user') {
      user.profile = sanitizeHealthProfile(body.profile, user.profile || {});
    }

    await user.save();

    return json({ user: user.toPublicJSON() });
  } catch (error) {
    console.error('Update user error:', error);
    return errorResponse('Unable to update user', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    if (!isValidId(params.id)) {
      return errorResponse('User not found', 404);
    }

    await connectDB();

    if (String(auth.admin._id) === String(params.id)) {
      return errorResponse('You cannot delete your own admin account', 400);
    }

    const user = await User.findByIdAndDelete(params.id);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const photoId = user.photoPublicId || publicIdFromUrl(user.photoURL);
    if (photoId) {
      await deleteImage(photoId);
    }

    return json({ message: 'User deleted', id: params.id });
  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse('Unable to delete user', 500);
  }
}
