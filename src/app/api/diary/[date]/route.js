import { requireAuth } from 'src/lib/require-auth';
import { resolveLocalDate } from 'src/lib/streak';
import { DATE_RE, sanitizeDiaryDay } from 'src/lib/diary';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { DiaryDay } from 'src/models/diary-day';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

function emptyDay(date) {
  return {
    date,
    meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    exercise: [],
    water: 0,
  };
}

/** GET /api/diary/:date — one day of the signed-in user's diary. */
export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    if (!DATE_RE.test(params.date)) return errorResponse('Invalid date', 400);

    const doc = await DiaryDay.findOne({ user: auth.user._id, date: params.date });
    return json({ day: doc ? doc.toPublicJSON() : emptyDay(params.date) });
  } catch (error) {
    console.error('Diary day error:', error);
    return errorResponse('Unable to load diary day', 500);
  }
}

/**
 * PUT /api/diary/:date — replace today's diary.
 * Body: { today: 'YYYY-MM-DD' (device local), meals, exercise, water }
 * Only the user's current day can be written; past and future days are read-only.
 */
export async function PUT(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const { date } = params;
    if (!DATE_RE.test(date)) return errorResponse('Invalid date', 400);

    const body = await request.json();
    const today = resolveLocalDate(body.today);

    if (date !== today) {
      return errorResponse(
        date < today
          ? 'Past diary days are view-only and cannot be changed.'
          : 'You can only log for today.',
        403
      );
    }

    const day = sanitizeDiaryDay(body);
    const doc = await DiaryDay.findOneAndUpdate(
      { user: auth.user._id, date },
      { $set: { ...day, user: auth.user._id, date } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true }
    );

    return json({ day: doc.toPublicJSON() });
  } catch (error) {
    console.error('Diary save error:', error);
    return errorResponse('Unable to save diary', 500);
  }
}
