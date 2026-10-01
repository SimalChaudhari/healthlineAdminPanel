import { connectDB } from 'src/lib/mongodb';
import { getBearerToken, verifyAccessToken } from 'src/lib/jwt';
import { errorResponse } from 'src/lib/api-response';
import { User } from 'src/models/user';

/** Any signed-in user (admin or app user). Blocks Blocked accounts. */
export async function requireAuth(request) {
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
