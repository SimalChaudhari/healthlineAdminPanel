import { requireAuth } from 'src/lib/require-auth';
import { replaceImage, publicIdFromUrl } from 'src/lib/cloudinary';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

const MAX_BYTES = 3 * 1024 * 1024; // 3MB
const ALLOWED_FOLDERS = new Set(['healthline/users', 'healthline/foods', 'users', 'foods']);

function normalizeFolder(raw) {
  const folder = String(raw || 'healthline/users')
    .trim()
    .replace(/^\/+|\/+$/g, '');
  if (!folder) return 'healthline/users';
  if (ALLOWED_FOLDERS.has(folder)) {
    return folder.includes('/') ? folder : `healthline/${folder}`;
  }
  // Allow healthline/<leaf> only
  if (/^healthline\/[a-z0-9_-]+$/i.test(folder)) return folder;
  return 'healthline/users';
}

function isUserAvatarFolder(folder) {
  return folder === 'healthline/users' || folder.endsWith('/users');
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const contentType = request.headers.get('content-type') || '';

    let dataUrl = '';
    let remoteUrl = '';
    let folder = 'healthline/users';
    let replacePublicId = '';
    let replaceUrl = '';
    let targetUserId = '';

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      folder = normalizeFolder(form.get('folder') || folder);
      replacePublicId = String(form.get('replacePublicId') || '');
      replaceUrl = String(form.get('replaceUrl') || '');
      targetUserId = String(form.get('userId') || '');
      remoteUrl = String(form.get('remoteUrl') || '');

      if (file && typeof file !== 'string') {
        if (file.size > MAX_BYTES) {
          return errorResponse('Image must be 3MB or smaller', 400);
        }

        const type = file.type || 'image/jpeg';
        if (!type.startsWith('image/')) {
          return errorResponse('Only image files are allowed', 400);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        dataUrl = `data:${type};base64,${buffer.toString('base64')}`;
      } else if (!remoteUrl) {
        return errorResponse('Image file is required', 400);
      }
    } else {
      const body = await request.json();
      dataUrl = String(body.file || body.dataUrl || '');
      remoteUrl = String(body.remoteUrl || body.url || '');
      folder = normalizeFolder(body.folder || folder);
      replacePublicId = String(body.replacePublicId || '');
      replaceUrl = String(body.replaceUrl || '');
      targetUserId = String(body.userId || '');

      if (dataUrl) {
        if (!dataUrl.startsWith('data:image/')) {
          return errorResponse('A valid image data URL is required', 400);
        }

        const base64 = dataUrl.split(',')[1] || '';
        const size = Math.ceil((base64.length * 3) / 4);
        if (size > MAX_BYTES) {
          return errorResponse('Image must be 3MB or smaller', 400);
        }
      } else if (!remoteUrl) {
        return errorResponse('Image file or remoteUrl is required', 400);
      }
    }

    const fileInput = dataUrl || remoteUrl;
    const userAvatar = isUserAvatarFolder(folder);

    // Prefer explicit replace ids; only fall back to caller avatar for user-folder uploads
    const previousPublicId =
      replacePublicId ||
      (userAvatar
        ? auth.user.photoPublicId || publicIdFromUrl(replaceUrl || auth.user.photoURL)
        : publicIdFromUrl(replaceUrl));

    // Stable id = overwrite same Cloudinary asset. Never use an admin's id for another user.
    // Food uploads get a unique Cloudinary id (no stablePublicId).
    const ownId = auth.user.role === 'user' ? String(auth.user._id) : undefined;
    const stableId = userAvatar ? targetUserId || ownId : undefined;

    const uploaded = await replaceImage({
      fileInput,
      folder,
      previousPublicId,
      previousUrl: replaceUrl || (userAvatar ? auth.user.photoURL : ''),
      stablePublicId: stableId,
    });

    // Keep DB in sync only when updating a user avatar — never for food images
    if (userAvatar && (!targetUserId || String(targetUserId) === String(auth.user._id))) {
      auth.user.photoURL = uploaded.url;
      auth.user.photoPublicId = uploaded.publicId;
      await auth.user.save();
    }

    return json({
      url: uploaded.url,
      publicId: uploaded.publicId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse(error.message || 'Unable to upload image', 500);
  }
}
