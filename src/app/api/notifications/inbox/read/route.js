import { requireAuth } from 'src/lib/require-auth';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { User } from 'src/models/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

/** POST /api/notifications/inbox/read — mark everything in the inbox as read (called when the app opens it). */
export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const now = new Date();
    await User.updateOne({ _id: auth.user._id }, { $set: { inboxReadAt: now } });
    return json({ ok: true, readAt: now });
  } catch (error) {
    console.error('Inbox read error:', error);
    return errorResponse('Unable to update notifications', 500);
  }
}
