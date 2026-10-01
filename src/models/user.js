import mongoose from 'mongoose';

import { publicStreak } from 'src/lib/streak';

const healthProfileSchema = new mongoose.Schema(
  {
    sex: { type: String, default: '', trim: true },
    age: { type: Number, default: 30 },
    heightCm: { type: Number, default: 168 },
    activity: { type: String, default: 'Moderate', trim: true },
    goal: { type: String, enum: ['lose', 'maintain', 'gain'], default: 'lose' },
    calories: { type: Number, default: 2200 },
    carbs: { type: Number, default: 220 },
    protein: { type: Number, default: 140 },
    fat: { type: Number, default: 73 },
    waterGoal: { type: Number, default: 8 },
    weight: { type: Number, default: 72 },
    goalWeight: { type: Number, default: 68 },
    diet: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    conditions: { type: [String], default: [] },
    focusGoals: { type: [String], default: [] },
    reminders: {
      breakfast: { type: Boolean, default: true },
      lunch: { type: Boolean, default: true },
      dinner: { type: Boolean, default: true },
      water: { type: Boolean, default: true },
      weighIn: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const streakSchema = new mongoose.Schema(
  {
    current: { type: Number, default: 0 },
    best: { type: Number, default: 0 },
    /** User's local calendar day of the last app open, YYYY-MM-DD */
    lastActiveDate: { type: String, default: '' },
    /** Recent open days (capped) for the streak calendar */
    activeDates: { type: [String], default: [] },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    firstName: { type: String, default: '', trim: true },
    lastName: { type: String, default: '', trim: true },
    displayName: { type: String, default: '', trim: true },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    plan: {
      type: String,
      default: 'Free',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Trial', 'Blocked'],
      default: 'Active',
    },
    photoURL: { type: String, default: '' },
    photoPublicId: { type: String, default: '', select: true },
    phoneNumber: { type: String, default: '' },
    /** Onboarding preferences — goals, body metrics, diet, reminders */
    profile: { type: healthProfileSchema, default: () => ({}) },
    /** Daily app-open streak (see src/lib/streak.js) */
    streak: { type: streakSchema, default: () => ({}) },
    /** Food ids the user hearted in the app (newest first); details come from `foods`. */
    favorites: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }], default: [] },
    /** Expo push tokens for this user's devices (see /api/push-token). Never sent to clients. */
    pushTokens: { type: [String], default: [], select: false },
  },
  { timestamps: true }
);

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function strList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((v) => String(v || '').trim()).filter(Boolean))];
}

/** Exclusive alone is valid; if mixed with others, drop the exclusive flag. */
function exclusiveStrList(value, exclusiveKey) {
  const list = strList(value);
  if (!exclusiveKey || !list.includes(exclusiveKey)) return list;
  if (list.length === 1) return list;
  return list.filter((v) => v !== exclusiveKey);
}

/** Normalize onboarding / client profile payload for Mongo. */
export function sanitizeHealthProfile(input = {}, fallback = {}) {
  const src = input && typeof input === 'object' ? input : {};
  const base = fallback && typeof fallback === 'object' ? fallback : {};
  const goal = ['lose', 'maintain', 'gain'].includes(src.goal) ? src.goal : base.goal || 'lose';
  const remindersIn = src.reminders && typeof src.reminders === 'object' ? src.reminders : {};
  const remindersBase = base.reminders && typeof base.reminders === 'object' ? base.reminders : {};

  return {
    sex: String(src.sex ?? base.sex ?? '').trim(),
    age: num(src.age ?? base.age, 30),
    heightCm: num(src.heightCm ?? base.heightCm, 168),
    activity: String(src.activity ?? base.activity ?? 'Moderate').trim() || 'Moderate',
    goal,
    calories: num(src.calories ?? base.calories, 2200),
    carbs: num(src.carbs ?? base.carbs, 220),
    protein: num(src.protein ?? base.protein, 140),
    fat: num(src.fat ?? base.fat, 73),
    waterGoal: num(src.waterGoal ?? base.waterGoal, 8),
    weight: num(src.weight ?? base.weight, 72),
    goalWeight: num(src.goalWeight ?? base.goalWeight, 68),
    diet: exclusiveStrList(src.diet ?? base.diet, 'No preference'),
    allergies: strList(src.allergies ?? base.allergies),
    conditions: exclusiveStrList(src.conditions ?? base.conditions, 'None'),
    focusGoals: strList(src.focusGoals ?? base.focusGoals),
    reminders: {
      breakfast: remindersIn.breakfast ?? remindersBase.breakfast ?? true,
      lunch: remindersIn.lunch ?? remindersBase.lunch ?? true,
      dinner: remindersIn.dinner ?? remindersBase.dinner ?? true,
      water: remindersIn.water ?? remindersBase.water ?? true,
      weighIn: remindersIn.weighIn ?? remindersBase.weighIn ?? false,
    },
  };
}

userSchema.methods.toPublicJSON = function toPublicJSON() {
  const profile = this.profile?.toObject?.() || this.profile || {};
  return {
    id: String(this._id),
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    displayName: this.displayName || [this.firstName, this.lastName].filter(Boolean).join(' '),
    name: this.displayName || [this.firstName, this.lastName].filter(Boolean).join(' ') || this.email,
    role: this.role,
    plan: this.plan || 'Free',
    status: this.status || 'Active',
    photoURL: this.photoURL,
    photoPublicId: this.photoPublicId || '',
    phoneNumber: this.phoneNumber,
    profile: sanitizeHealthProfile(profile),
    streak: publicStreak(this.streak),
    joined: this.createdAt ? new Date(this.createdAt).toISOString().slice(0, 10) : '',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
