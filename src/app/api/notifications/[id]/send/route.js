import mongoose from 'mongoose';

import { connectDB } from 'src/lib/mongodb';
import { sendCampaign } from 'src/lib/expo-push';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Notification } from 'src/models/notification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Sending to many devices can take a while (100 per Expo request) — allow up to 60s on Vercel.
export const maxDuration = 60;

export function OPTIONS() {
  return optionsResponse();
}

/** POST /api/notifications/:id/send — push a Draft to its audience now. */
export async function POST(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;
    if (!mongoose.Types.ObjectId.isValid(params.id)) return errorResponse('Notification not found', 404);

    await connectDB();
    const notification = await Notification.findById(params.id);
    if (!notification) return errorResponse('Notification not found', 404);
    if (notification.status === 'Sent') return errorResponse('Already sent', 409);

    const result = await sendCampaign(notification);
    return json({ notification: notification.toPublicJSON(), result });
  } catch (error) {
    console.error('Send notification error:', error);
    return errorResponse('Unable to send notification', 500);
  }
}
