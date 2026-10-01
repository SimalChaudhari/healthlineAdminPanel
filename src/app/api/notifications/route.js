import { connectDB } from 'src/lib/mongodb';
import { sendCampaign } from 'src/lib/expo-push';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Notification, parseNotificationBody } from 'src/models/notification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// POST with `send: true` pushes to every matching device — allow up to 60s on Vercel.
export const maxDuration = 60;

export function OPTIONS() {
  return optionsResponse();
}

/** GET /api/notifications — admin list, newest first. */
export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    await connectDB();
    const rows = await Notification.find().sort({ createdAt: -1 });
    return json({ notifications: rows.map((n) => n.toPublicJSON()) });
  } catch (error) {
    console.error('List notifications error:', error);
    return errorResponse('Unable to load notifications', 500);
  }
}

/** POST /api/notifications — body { title, body, audience, send? }. `send: true` pushes immediately. */
export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const payload = parseNotificationBody(body);
    if (!payload.title) return errorResponse('Title is required', 400);
    if (!payload.body) return errorResponse('Message is required', 400);

    await connectDB();
    const notification = await Notification.create(payload);

    const result = body.send ? await sendCampaign(notification) : null;
    return json({ notification: notification.toPublicJSON(), result }, 201);
  } catch (error) {
    console.error('Create notification error:', error);
    return errorResponse('Unable to create notification', 500);
  }
}
