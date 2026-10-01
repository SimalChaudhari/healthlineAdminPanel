import mongoose from 'mongoose';

/**
 * App reminders the Healthline APK schedules on each phone.
 * Admin decides which exist (enabled), their text/times/days, and whether they start ON for users (defaultOn).
 * Keys match the icons in the APK Reminders screen.
 */
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** 1 = Sunday … 7 = Saturday (expo-notifications convention) */
export const ALL_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

/** Unique, sorted 1–7 values; anything else is dropped. */
export function normalizeWeekdays(value) {
  const list = (Array.isArray(value) ? value : []).map(Number);
  return [...new Set(list)].filter((d) => Number.isInteger(d) && d >= 1 && d <= 7).sort();
}

const reminderSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    body: { type: String, required: true, trim: true, maxlength: 200 },
    /** 24h "HH:mm", one notification per time */
    times: { type: [String], default: [] },
    /** Days it fires on, 1 = Sunday … 7 = Saturday. All 7 = every day. */
    weekdays: { type: [Number], default: undefined },
    /** Legacy single day (0 = every day). Read only when `weekdays` is missing. */
    weekday: { type: Number, default: undefined },
    /** Off = hidden in the app and never scheduled */
    enabled: { type: Boolean, default: true },
    /** Starting toggle value for users who have not changed it */
    defaultOn: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reminderSettingSchema.methods.getWeekdays = function getWeekdays() {
  const days = normalizeWeekdays(this.weekdays);
  if (days.length) return days;
  return this.weekday >= 1 && this.weekday <= 7 ? [this.weekday] : ALL_WEEKDAYS;
};

reminderSettingSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    key: this.key,
    label: this.label,
    title: this.title,
    body: this.body,
    times: (this.times || []).filter((t) => TIME_RE.test(t)),
    weekdays: this.getWeekdays(),
    enabled: !!this.enabled,
    defaultOn: !!this.defaultOn,
    sortOrder: this.sortOrder ?? 0,
    updatedAt: this.updatedAt,
  };
};

// Re-register on hot reload: a cached model keeps the old schema and silently drops new fields.
if (mongoose.models.ReminderSetting) mongoose.deleteModel('ReminderSetting');
export const ReminderSetting = mongoose.model('ReminderSetting', reminderSettingSchema);

export const DEFAULT_REMINDERS = [
  {
    key: 'breakfast',
    label: 'Breakfast reminder',
    title: 'Breakfast time',
    body: 'Time to fuel your morning.',
    times: ['08:00'],
    defaultOn: true,
  },
  {
    key: 'lunch',
    label: 'Lunch reminder',
    title: 'Lunch time',
    body: 'Log lunch — stay on track.',
    times: ['12:30'],
    defaultOn: true,
  },
  {
    key: 'snack',
    label: 'Snack reminder',
    title: 'Snack window',
    body: 'Smart snack window open.',
    times: ['16:00'],
  },
  {
    key: 'exercise',
    label: 'Exercise reminder',
    title: 'Move a little',
    body: 'Move for 10 minutes today.',
    times: ['18:00'],
  },
  {
    key: 'dinner',
    label: 'Dinner reminder',
    title: 'Dinner time',
    body: 'Plan a balanced dinner tonight.',
    times: ['19:00'],
    defaultOn: true,
  },
  {
    key: 'water',
    label: 'Water nudge',
    title: 'Hydration check',
    body: 'Drink a glass of water.',
    times: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    defaultOn: true,
  },
  {
    key: 'foodLog',
    label: 'Food logging',
    title: 'Log today’s meals',
    body: 'Open the app to mark meals Done.',
    times: ['21:00'],
  },
  {
    key: 'mealPlan',
    label: 'Meal planning',
    title: 'Plan your week',
    body: 'Build next week’s meal plan.',
    times: ['18:00'],
    weekdays: [1],
  },
  {
    key: 'weighIn',
    label: 'Weekly weigh-in',
    title: 'Weekly weigh-in',
    body: 'Log weight · celebrate progress.',
    times: ['08:00'],
    weekdays: [1],
  },
].map((r, i) => ({ weekdays: ALL_WEEKDAYS, defaultOn: false, enabled: true, sortOrder: i, ...r }));

/**
 * Insert any missing default reminders (never overwrites admin edits), and move rows saved with the
 * old single `weekday` (0 = every day) onto `weekdays`.
 */
export async function ensureDefaultReminders() {
  await ReminderSetting.updateMany(
    { weekdays: { $exists: false } },
    [
      {
        $set: {
          weekdays: {
            $cond: [
              { $and: [{ $gte: ['$weekday', 1] }, { $lte: ['$weekday', 7] }] },
              ['$weekday'],
              ALL_WEEKDAYS,
            ],
          },
        },
      },
      { $unset: 'weekday' },
    ],
    { updatePipeline: true }
  );

  await ReminderSetting.bulkWrite(
    DEFAULT_REMINDERS.map((r) => ({
      updateOne: { filter: { key: r.key }, update: { $setOnInsert: r }, upsert: true },
    }))
  );
}

/** Admin PUT body → validated fields (key/label are fixed). */
export function parseReminderUpdate(body = {}) {
  const times = [
    ...new Set((Array.isArray(body.times) ? body.times : []).map((t) => String(t).trim())),
  ]
    .filter((t) => TIME_RE.test(t))
    .sort();

  return {
    title: String(body.title || '').trim(),
    body: String(body.body || '').trim(),
    times,
    weekdays: normalizeWeekdays(body.weekdays),
    enabled: body.enabled !== false,
    defaultOn: !!body.defaultOn,
  };
}
