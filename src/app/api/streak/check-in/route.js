import { requireAuth } from 'src/lib/require-auth';
import { applyCheckIn, publicStreak, resolveLocalDate } from 'src/lib/streak';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return optionsResponse();
}

/**
 * Called by the app whenever it opens / comes to the foreground.
 * Body: { date: 'YYYY-MM-DD' } — the device's local calendar day.
 */
export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    let body = {};
    try {
      body = await request.json();
    } catch {
      // empty body — fall back to server date
    }

    const today = resolveLocalDate(body.date);
    const { user } = auth;
    const { changed } = applyCheckIn(user.streak, today);

    if (changed) {
      user.markModified('streak');
      await user.save();
    }

    return json({ streak: publicStreak(user.streak), today, counted: changed });
  } catch (error) {
    console.error('Streak check-in error:', error);
    return errorResponse('Unable to update streak', 500);
  }
}
