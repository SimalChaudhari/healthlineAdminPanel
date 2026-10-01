import { connectDB } from 'src/lib/mongodb';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { ReminderSetting, parseReminderUpdate } from 'src/models/reminder-setting';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

/** PUT /api/reminders/:key — admin edits text, times, days, enabled, defaultOn. */
export async function PUT(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const payload = parseReminderUpdate(await request.json());
    if (!payload.title) return errorResponse('Title is required', 400);
    if (!payload.body) return errorResponse('Message is required', 400);
    if (!payload.times.length) return errorResponse('Add at least one time (HH:mm)', 400);
    if (!payload.weekdays.length) return errorResponse('Select at least one day', 400);

    await connectDB();
    const reminder = await ReminderSetting.findOne({ key: params.key });
    if (!reminder) return errorResponse('Reminder not found', 404);

    Object.assign(reminder, payload);
    reminder.weekday = undefined; // legacy single-day field, replaced by weekdays
    await reminder.save();
    return json({ reminder: reminder.toPublicJSON() });
  } catch (error) {
    console.error('Update reminder error:', error);
    return errorResponse('Unable to update reminder', 500);
  }
}
