import { connectDB } from 'src/lib/mongodb';
import { getBearerToken, verifyAccessToken } from 'src/lib/jwt';
import { errorResponse } from 'src/lib/api-response';
import { User } from 'src/models/user';

export async function requireAdmin(request) {
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

  const admin = await User.findById(payload.sub);

  if (!admin || admin.role !== 'admin') {
    return { error: errorResponse('Forbidden', 403) };
  }

  return { admin };
}
