import { requireAdmin } from 'src/lib/require-admin';
import { json, errorResponse, optionsResponse } from 'src/lib/api-response';
import { Plan, parsePriceAmount } from 'src/models/plan';
import { User } from 'src/models/user';
import { DiaryDay } from 'src/models/diary-day';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Day boundaries for "today" / 7-day charts. App users are India-first. */
const TZ = 'Asia/Kolkata';
const DAYS = 7;
const MEAL_KEYS = ['breakfast', 'lunch', 'dinner', 'snacks'];

const dayFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const labelFmt = new Intl.DateTimeFormat('en-IN', { timeZone: TZ, weekday: 'short' });

function dayKey(date) {
  return dayFmt.format(date);
}

function lastDays(n, now = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getTime() - (n - 1 - i) * 86400000);
    return { key: dayKey(d), label: labelFmt.format(d) };
  });
}

function pct(part, whole) {
  return whole ? Math.round((part / whole) * 1000) / 10 : 0;
}

export function OPTIONS() {
  return optionsResponse();
}

/**
 * GET /api/dashboard/stats — live admin dashboard numbers from MongoDB.
 * Metrics with no data source yet (payments, AI requests, reports) are returned as null.
 */
export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const days = lastDays(DAYS);
    const keys = days.map((d) => d.key);
    const today = keys[keys.length - 1];

    const [users, plans, diaryDocs] = await Promise.all([
      User.find({ role: 'user' })
        .select('firstName lastName displayName email plan status createdAt streak favorites')
        .sort({ createdAt: -1 })
        .lean(),
      Plan.find({}).sort({ sortOrder: 1 }).lean(),
      DiaryDay.find({ date: { $in: keys } })
        .select('date meals exercise water')
        .lean(),
    ]);

    // ---- Users -------------------------------------------------------------
    const joinedKey = (u) => (u.createdAt ? dayKey(new Date(u.createdAt)) : '');
    const activeDates = (u) => new Set(u.streak?.activeDates || []);
    const userActive = users.map(activeDates);

    const totalUsers = users.length;
    const newByDay = keys.map((k) => users.filter((u) => joinedKey(u) === k).length);
    const totalByDay = keys.map((k) => users.filter((u) => joinedKey(u) && joinedKey(u) <= k).length);
    const activeByDay = keys.map((k) => userActive.filter((set) => set.has(k)).length);
    const activeToday = activeByDay[activeByDay.length - 1];
    const active7d = userActive.filter((set) => keys.some((k) => set.has(k))).length;
    const blocked = users.filter((u) => u.status === 'Blocked').length;

    // ---- Plans & estimated revenue ----------------------------------------
    const priceByCode = new Map(
      plans.map((p) => [String(p.code || p.name).toLowerCase(), parsePriceAmount(p.priceMonthly) ?? 0])
    );
    const planOf = (u) => String(u.plan || 'Free');
    const isPaid = (u) => (priceByCode.get(planOf(u).toLowerCase()) ?? 0) > 0;
    const premium = users.filter(isPaid).length;
    const estimatedMrr = users
      .filter((u) => u.status !== 'Blocked')
      .reduce((sum, u) => sum + (priceByCode.get(planOf(u).toLowerCase()) ?? 0), 0);

    const planCounts = new Map();
    plans.forEach((p) => planCounts.set(p.name || p.code, 0));
    users.forEach((u) => {
      const match = plans.find(
        (p) => String(p.code).toLowerCase() === planOf(u).toLowerCase() ||
          String(p.name).toLowerCase() === planOf(u).toLowerCase()
      );
      const label = match ? match.name || match.code : planOf(u);
      planCounts.set(label, (planCounts.get(label) || 0) + 1);
    });

    // ---- Diary activity ----------------------------------------------------
    const byDay = new Map(keys.map((k) => [k, { loggers: 0, meals: 0, workouts: 0, water: 0 }]));
    diaryDocs.forEach((doc) => {
      const bucket = byDay.get(doc.date);
      if (!bucket) return;
      const mealItems = MEAL_KEYS.reduce((n, m) => n + (doc.meals?.[m]?.length || 0), 0);
      if (mealItems > 0) bucket.loggers += 1;
      bucket.meals += mealItems;
      bucket.workouts += doc.exercise?.length || 0;
      bucket.water += Number(doc.water) || 0;
    });
    const diarySeries = keys.map((k) => byDay.get(k));
    const sum = (field) => diarySeries.reduce((n, d) => n + d[field], 0);

    const favouriteFoods = users.reduce((n, u) => n + (u.favorites?.length || 0), 0);

    return json({
      generatedAt: new Date().toISOString(),
      timeZone: TZ,
      today,
      stats: {
        totalUsers,
        newToday: newByDay[newByDay.length - 1],
        newLast7Days: newByDay.reduce((a, b) => a + b, 0),
        activeToday,
        activeTodayPct: pct(activeToday, totalUsers),
        active7d,
        premium,
        conversionPct: pct(premium, totalUsers),
        blocked,
        estimatedMrr,
        loggedFoodToday: diarySeries[diarySeries.length - 1].loggers,
        mealsToday: diarySeries[diarySeries.length - 1].meals,
        favouriteFoods,
        // No data source yet — shown as "Not tracked yet" in the UI.
        revenueCollected: null,
        aiRequests: null,
        reportsUploaded: null,
      },
      charts: {
        categories: days.map((d) => d.label),
        users: { total: totalByDay, active: activeByDay, newUsers: newByDay },
        diary: {
          loggers: diarySeries.map((d) => d.loggers),
          meals: diarySeries.map((d) => d.meals),
        },
        plans: Array.from(planCounts, ([label, value]) => ({ label, value })),
        engagement: [
          { label: 'App opens', value: activeByDay.reduce((a, b) => a + b, 0) },
          { label: 'Meals logged', value: sum('meals') },
          { label: 'Workouts logged', value: sum('workouts') },
          { label: 'Water glasses', value: sum('water') },
          { label: 'Favourite foods', value: favouriteFoods },
        ],
      },
      recentUsers: users.slice(0, 8).map((u) => ({
        id: String(u._id),
        name:
          u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
        email: u.email,
        plan: planOf(u),
        status: u.status || 'Active',
        joined: joinedKey(u),
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return errorResponse('Unable to load dashboard', 500);
  }
}
