import { connectDB } from 'src/lib/mongodb';
import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { ReminderSetting, ensureDefaultReminders } from 'src/models/reminder-setting';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

/**
 * GET /api/reminders — public list for the APK (enabled only).
 * `?all=1` needs admin and includes disabled reminders.
 */
export async function GET(request) {
  try {
    await connectDB();
    await ensureDefaultReminders();

    const wantAll = new URL(request.url).searchParams.get('all') === '1';
    if (wantAll) {
      const auth = await requireAdmin(request);
      if (auth.error) return auth.error;
    }

    const rows = await ReminderSetting.find(wantAll ? {} : { enabled: true }).sort({
      sortOrder: 1,
    });
    return json({ reminders: rows.map((r) => r.toPublicJSON()) });
  } catch (error) {
    console.error('List reminders error:', error);
    return errorResponse('Unable to load reminders', 500);
  }
}
