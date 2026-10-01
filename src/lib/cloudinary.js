import { v2 as cloudinary } from 'cloudinary';

/**
 * Parse CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
 */
function parseCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.includes('<your_api_key>') || url.includes('<your_api_secret>')) {
    throw new Error(
      'CLOUDINARY_URL still has placeholders. Replace <your_api_key> and <your_api_secret> with real values from Cloudinary.'
    );
  }

  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/]+)/i);
  if (!match) return null;

  return {
    cloud_name: match[3],
    api_key: match[1],
    api_secret: match[2],
  };
}

function getCloudinaryConfig() {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);

  const cloudName = fromUrl?.cloud_name || process.env.CLOUDINARY_CLOUD_NAME || '';
  const apiKey = fromUrl?.api_key || process.env.CLOUDINARY_API_KEY || '';
  const apiSecret = fromUrl?.api_secret || process.env.CLOUDINARY_API_SECRET || '';

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME=dwijhft25 plus API key and secret in .env'
    );
  }

  if (cloudName.toLowerCase() === 'healthline') {
    throw new Error(
      'CLOUDINARY_CLOUD_NAME cannot be "HealthLine". Use your Cloud name from the dashboard (e.g. dwijhft25).'
    );
  }

  return {
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  };
}

export function getCloudinary() {
  cloudinary.config(getCloudinaryConfig());
  return cloudinary;
}

/** Extract Cloudinary public_id from a secure_url (best-effort). */
export function publicIdFromUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('cloudinary.com')) return '';

  try {
    const { pathname } = new URL(url);
    const parts = pathname.split('/').filter(Boolean);
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return '';

    let rest = parts.slice(uploadIndex + 1);
    const versionIndex = rest.findIndex((part) => /^v\d+$/.test(part));
    if (versionIndex >= 0) {
      rest = rest.slice(versionIndex + 1);
    }

    if (!rest.length) return '';
    return rest.join('/').replace(/\.[^/.]+$/, '');
  } catch {
    return '';
  }
}

/**
 * Resolve Cloudinary folder. Respects caller folder (users / foods / …).
 * If CLOUDINARY_FOLDER is set (e.g. "healthline"), uses `${root}/${leaf}`.
 */
function resolveUploadFolder(folder = 'healthline/users') {
  const requested = String(folder || 'healthline/users').replace(/^\/+|\/+$/g, '');
  const root = String(process.env.CLOUDINARY_FOLDER || '').replace(/^\/+|\/+$/g, '');
  if (!root) return requested;

  const leaf = requested.includes('/') ? requested.split('/').pop() : requested;
  return `${root}/${leaf || 'users'}`;
}

/**
 * Upload a base64 data URL or remote URL to Cloudinary.
 * @returns {{ url: string, publicId: string }}
 */
export async function uploadImage(fileInput, { folder = 'healthline/users', publicId } = {}) {
  const cld = getCloudinary();
  const options = {
    folder: resolveUploadFolder(folder),
    resource_type: 'image',
    overwrite: true,
    invalidate: true,
  };
  if (publicId) options.public_id = publicId;

  const result = await cld.uploader.upload(fileInput, options);

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteImage(publicId) {
  if (!publicId) return null;
  const cld = getCloudinary();
  try {
    return await cld.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  } catch (error) {
    console.warn('Cloudinary delete failed:', publicId, error?.message || error);
    return null;
  }
}

/** Delete previous asset when replacing an image (user avatar, food photo, etc.). */
export async function replaceImage({ fileInput, folder, previousPublicId, previousUrl, stablePublicId }) {
  const uploaded = await uploadImage(fileInput, {
    folder,
    publicId: stablePublicId,
  });

  const oldId = previousPublicId || publicIdFromUrl(previousUrl);
  if (oldId && oldId !== uploaded.publicId) {
    await deleteImage(oldId);
  }

  return uploaded;
}

/** @deprecated Prefer replaceImage — kept for older imports. */
export async function replaceUserPhoto(opts) {
  return replaceImage(opts);
}
