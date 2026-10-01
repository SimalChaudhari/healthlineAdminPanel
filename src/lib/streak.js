/**
 * Daily app-open streak. Dates are the user's local calendar day (YYYY-MM-DD),
 * sent by the app on open. Opening on consecutive days grows the streak;
 * missing a day resets it to 1 on the next open.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_ACTIVE_DATES = 120;

export function toDateKey(d) {
  return d.toISOString().slice(0, 10);
}

export function shiftDateKey(key, delta) {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return toDateKey(d);
}

/**
 * Trust the device's local date only within ±1 day of the server's UTC date
 * (covers every real time zone) so a changed phone clock can't farm days.
 */
export function resolveLocalDate(input, now = new Date()) {
  const utcToday = toDateKey(now);
  const value = String(input || '').trim();
  if (!DATE_RE.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) return utcToday;
  if (value < shiftDateKey(utcToday, -1) || value > shiftDateKey(utcToday, 1)) return utcToday;
  return value;
}

/** Applies one app open on `today` to the stored streak. Mutates and returns `streak`. */
export function applyCheckIn(streak, today) {
  const s = streak || {};
  const last = s.lastActiveDate || '';

  // Same day (or an older date than already recorded) — nothing to add.
  if (last && today <= last) return { streak: s, changed: false };

  s.current = last === shiftDateKey(today, -1) ? (s.current || 0) + 1 : 1;
  s.best = Math.max(s.best || 0, s.current);
  s.lastActiveDate = today;
  s.activeDates = [...(s.activeDates || []), today].slice(-MAX_ACTIVE_DATES);

  return { streak: s, changed: true };
}

export function publicStreak(streak) {
  return {
    current: streak?.current || 0,
    best: streak?.best || 0,
    lastActiveDate: streak?.lastActiveDate || '',
    activeDates: Array.isArray(streak?.activeDates) ? [...streak.activeDates] : [],
  };
}
