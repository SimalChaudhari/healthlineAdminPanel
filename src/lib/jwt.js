import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }

  return secret;
}

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id || user._id),
      email: user.email,
      role: user.role,
    },
    getSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getSecret());
}

export function getBearerToken(request) {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');

  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice(7).trim() || null;
}
