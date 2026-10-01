import { requireAuth } from 'src/lib/require-auth';
import { isExpoPushToken } from 'src/lib/expo-push';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { User } from 'src/models/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_DEVICES = 10;

export function OPTIONS() {
  return optionsResponse();
}

/** POST /api/push-token — body { token }. Links this device's Expo push token to the signed-in user. */
export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json().catch(() => ({}));
    const token = String(body.token || '').trim();
    if (!isExpoPushToken(token)) return errorResponse('Invalid Expo push token', 400);

    const userId = auth.user._id;
    // A device belongs to one account at a time (switching accounts on the same phone).
    await User.updateMany({ _id: { $ne: userId } }, { $pull: { pushTokens: token } });

    const user = await User.findById(userId).select('+pushTokens');
    const rest = (user.pushTokens || []).filter((t) => t !== token);
    user.pushTokens = [token, ...rest].slice(0, MAX_DEVICES);
    await user.save();

    return json({ ok: true });
  } catch (error) {
    console.error('Push token register error:', error);
    return errorResponse('Unable to save push token', 500);
  }
}

/** DELETE /api/push-token — body { token }. Called on sign-out. */
export async function DELETE(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json().catch(() => ({}));
    const token = String(body.token || '').trim();
    if (!token) return errorResponse('token is required', 400);

    await User.updateOne({ _id: auth.user._id }, { $pull: { pushTokens: token } });
    return json({ ok: true });
  } catch (error) {
    console.error('Push token remove error:', error);
    return errorResponse('Unable to remove push token', 500);
  }
}
