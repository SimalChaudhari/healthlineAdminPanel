import { connectDB } from 'src/lib/mongodb';
import { getBearerToken, verifyAccessToken } from 'src/lib/jwt';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { deleteImage, publicIdFromUrl } from 'src/lib/cloudinary';
import { User, sanitizeHealthProfile } from 'src/models/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

async function getAuthedUser(request) {
  const token = getBearerToken(request);

  if (!token) {
    return { error: errorResponse('Unauthorized', 401) };
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return { error: errorResponse('Unauthorized', 401) };
  }

  await connectDB();

  const user = await User.findById(payload.sub);

  if (!user) {
    return { error: errorResponse('Unauthorized', 401) };
  }

  if (user.status === 'Blocked') {
    return { error: errorResponse('This account has been blocked', 403) };
  }

  return { user };
}

export async function GET(request) {
  try {
    const result = await getAuthedUser(request);
    if (result.error) return result.error;

    return json({ user: result.user.toPublicJSON() });
  } catch (error) {
    console.error('Me error:', error);
    return errorResponse('Unable to load profile', 500);
  }
}

export async function PUT(request) {
  try {
    const result = await getAuthedUser(request);
    if (result.error) return result.error;

    const body = await request.json();
    const firstName = String(body.firstName ?? result.user.firstName ?? '').trim();
    const lastName = String(body.lastName ?? result.user.lastName ?? '').trim();
    const email = String(body.email ?? result.user.email ?? '')
      .trim()
      .toLowerCase();

    if (!email || !email.includes('@')) {
      return errorResponse('A valid email is required', 400);
    }

    if (email !== result.user.email) {
      const existing = await User.findOne({ email });
      if (existing && String(existing._id) !== String(result.user._id)) {
        return errorResponse('An account with this email already exists', 409);
      }
      result.user.email = email;
    }

    result.user.firstName = firstName;
    result.user.lastName = lastName;
    result.user.displayName =
      [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];

    if (body.photoURL !== undefined) {
      const nextUrl = String(body.photoURL || '').trim();
      const nextPublicId = String(body.photoPublicId || publicIdFromUrl(nextUrl) || '').trim();
      const prevPublicId =
        result.user.photoPublicId || publicIdFromUrl(result.user.photoURL) || '';

      if (nextUrl !== result.user.photoURL) {
        if (prevPublicId && prevPublicId !== nextPublicId) {
          await deleteImage(prevPublicId);
        }
        result.user.photoURL = nextUrl;
        result.user.photoPublicId = nextPublicId;
      } else if (nextPublicId && !result.user.photoPublicId) {
        result.user.photoPublicId = nextPublicId;
      }
    }

    if (body.phoneNumber !== undefined) {
      // E.164 from the APK PhoneInput (e.g. +919876543210); empty clears it.
      const phone = String(body.phoneNumber || '').trim();
      if (phone && !/^\+[1-9]\d{6,14}$/.test(phone)) {
        return errorResponse('Enter a valid phone number', 400);
      }
      result.user.phoneNumber = phone;
    }

    if (body.profile !== undefined) {
      result.user.profile = sanitizeHealthProfile(body.profile, result.user.profile || {});
    }

    await result.user.save();

    return json({ user: result.user.toPublicJSON() });
  } catch (error) {
    console.error('Update me error:', error);
    return errorResponse('Unable to update profile', 500);
  }
}
