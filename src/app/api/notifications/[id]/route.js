import mongoose from 'mongoose';

import { connectDB } from 'src/lib/mongodb';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Notification, parseNotificationBody } from 'src/models/notification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

async function findNotification(request, id) {
  const auth = await requireAdmin(request);
  if (auth.error) return { error: auth.error };
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: errorResponse('Notification not found', 404) };

  await connectDB();
  const notification = await Notification.findById(id);
  if (!notification) return { error: errorResponse('Notification not found', 404) };
  return { notification };
}

export async function GET(request, { params }) {
  try {
    const { error, notification } = await findNotification(request, params.id);
    if (error) return error;
    return json({ notification: notification.toPublicJSON() });
  } catch (error) {
    console.error('Get notification error:', error);
    return errorResponse('Unable to load notification', 500);
  }
}

/** PUT — edit a Draft. Sent campaigns are read-only. */
export async function PUT(request, { params }) {
  try {
    const { error, notification } = await findNotification(request, params.id);
    if (error) return error;
    if (notification.status === 'Sent') return errorResponse('A sent notification cannot be edited', 409);

    const payload = parseNotificationBody(await request.json());
    if (!payload.title) return errorResponse('Title is required', 400);
    if (!payload.body) return errorResponse('Message is required', 400);

    Object.assign(notification, payload);
    await notification.save();
    return json({ notification: notification.toPublicJSON() });
  } catch (error) {
    console.error('Update notification error:', error);
    return errorResponse('Unable to update notification', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error, notification } = await findNotification(request, params.id);
    if (error) return error;
    await notification.deleteOne();
    return json({ ok: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    return errorResponse('Unable to delete notification', 500);
  }
}
