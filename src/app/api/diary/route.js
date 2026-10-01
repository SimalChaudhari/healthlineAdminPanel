import { DATE_RE } from 'src/lib/diary';
import { requireAuth } from 'src/lib/require-auth';
import { resolveLocalDate, shiftDateKey } from 'src/lib/streak';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { DiaryDay } from 'src/models/diary-day';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_RANGE_DAYS = 400;

export function OPTIONS() {
  return optionsResponse();
}

/**
 * GET /api/diary?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Signed-in user's own diary days in the range (default: last 90 days).
 */
export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const to = DATE_RE.test(searchParams.get('to') || '')
      ? searchParams.get('to')
      : resolveLocalDate(searchParams.get('today'));
    let from = DATE_RE.test(searchParams.get('from') || '')
      ? searchParams.get('from')
      : shiftDateKey(to, -89);

    if (from > to) return errorResponse('`from` must be on or before `to`', 400);
    const earliest = shiftDateKey(to, -(MAX_RANGE_DAYS - 1));
    if (from < earliest) from = earliest;

    const docs = await DiaryDay.find({ user: auth.user._id, date: { $gte: from, $lte: to } }).sort({
      date: 1,
    });

    const days = {};
    docs.forEach((doc) => {
      days[doc.date] = doc.toPublicJSON();
    });

    return json({ from, to, days });
  } catch (error) {
    console.error('Diary list error:', error);
    return errorResponse('Unable to load diary', 500);
  }
}
