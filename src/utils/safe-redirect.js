import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

/**
 * Only allow same-origin relative paths (blocks open redirects).
 */
export function getSafeReturnTo(value, fallback = CONFIG.auth.redirectPath) {
  if (!value || typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();

  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    trimmed.includes('@') ||
    /^\/\\/i.test(trimmed)
  ) {
    return fallback;
  }

  if (typeof window !== 'undefined') {
    try {
      const url = new URL(trimmed, window.location.origin);
      if (url.origin !== window.location.origin) {
        return fallback;
      }
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return fallback;
    }
  }

  return trimmed;
}

/**
 * Allow only https auth provider redirect URLs.
 */
export function isSafeAuthRedirectUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    return (
      host === 'accounts.google.com' ||
      host.endsWith('.google.com') ||
      host.endsWith('.googleapis.com')
    );
  } catch {
    return false;
  }
}
