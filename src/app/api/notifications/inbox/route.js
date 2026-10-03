import { requireAuth } from 'src/lib/require-auth';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Notification } from 'src/models/notification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INBOX_LIMIT = 50;

export function OPTIONS() {
  return optionsResponse();
}

/**
 * GET /api/notifications/inbox — the signed-in app user's inbox: campaigns sent to "All" or their plan
 * since they joined, newest first. `unread` counts those sent after the user last opened the inbox.
 */
export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;
    const { user } = auth;

    const rows = await Notification.find({
      status: 'Sent',
      audience: { $in: ['All', user.plan || 'Free'] },
      sentAt: { $gte: user.createdAt || new Date(0) },
    })
      .sort({ sentAt: -1 })
      .limit(INBOX_LIMIT);

    const readAt = user.inboxReadAt ? user.inboxReadAt.getTime() : 0;
    const items = rows.map((n) => ({
      id: String(n._id),
      title: n.title,
      body: n.body,
      sentAt: n.sentAt,
      read: n.sentAt ? n.sentAt.getTime() <= readAt : true,
    }));

    return json({ items, unread: items.filter((i) => !i.read).length });
  } catch (error) {
    console.error('Inbox error:', error);
    return errorResponse('Unable to load notifications', 500);
  }
}
