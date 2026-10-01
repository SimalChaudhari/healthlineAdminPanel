import mongoose from 'mongoose';

import {
  DEFAULT_AI_FEATURES_BY_PLAN,
  normalizeAiFeatures,
} from 'src/config/ai-features';

/** Strip currency text → number (supports legacy "₹299/mo"). */
export function parsePriceAmount(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, value);
  const digits = String(value).replace(/[^\d.]/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? Math.max(0, n) : null;
}

export function formatInr(amount, suffix = '') {
  const n = parsePriceAmount(amount);
  if (n == null) return suffix ? `₹0${suffix}` : '₹0';
  const formatted = n.toLocaleString('en-IN');
  return suffix ? `₹${formatted}${suffix}` : `₹${formatted}`;
}

const planSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: '', trim: true },
    priceMonthly: { type: Number, default: 0, min: 0 },
    priceYearly: { type: Number, default: null, min: 0 },
    features: { type: [String], default: [] },
    /** AI tools unlocked for users on this plan (see src/config/ai-features.js). */
    aiFeatures: { type: [String], default: [] },
    highlight: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

planSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: String(this._id),
    code: this.code,
    name: this.name,
    tagline: this.tagline || '',
    priceMonthly: parsePriceAmount(this.priceMonthly) ?? 0,
    priceYearly: parsePriceAmount(this.priceYearly),
    features: Array.isArray(this.features) ? this.features.filter(Boolean) : [],
    aiFeatures: normalizeAiFeatures(this.aiFeatures),
    highlight: !!this.highlight,
    status: this.status || 'Active',
    sortOrder: this.sortOrder ?? 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/** Shape used by the Healthline APK subscription screen. */
planSchema.methods.toAppJSON = function toAppJSON() {
  const monthly = parsePriceAmount(this.priceMonthly) ?? 0;
  const yearly = parsePriceAmount(this.priceYearly);

  return {
    id: this.code,
    name: this.name,
    tagline: this.tagline || '',
    priceMonthly: monthly,
    priceYearly: yearly,
    highlight: !!this.highlight,
    features: Array.isArray(this.features) ? this.features.filter(Boolean) : [],
    aiFeatures: normalizeAiFeatures(this.aiFeatures),
  };
};

export const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

export const DEFAULT_PLANS = [
  {
    code: 'Free',
    name: 'Free',
    tagline: 'Build a healthy habit',
    priceMonthly: 0,
    priceYearly: null,
    highlight: false,
    sortOrder: 0,
    status: 'Active',
    aiFeatures: DEFAULT_AI_FEATURES_BY_PLAN.Free,
    features: [
      'Calories, macros & water',
      'Meal & exercise logging',
      'Basic charts & goals',
      'Limited AI (5 / day later)',
    ],
  },
  {
    code: 'Plus',
    name: 'Health line Plus',
    tagline: 'Personalization + AI insights',
    priceMonthly: 199,
    priceYearly: 1999,
    highlight: true,
    sortOrder: 1,
    status: 'Active',
    aiFeatures: DEFAULT_AI_FEATURES_BY_PLAN.Plus,
    features: [
      'Everything in Free',
      'Unlimited reasonable AI',
      'Adaptive calorie & macros',
      'AI daily briefing & coach',
      'Advanced insights',
    ],
  },
  {
    code: 'Family',
    name: 'Health line Family',
    tagline: 'Up to 5 profiles',
    priceMonthly: 299,
    priceYearly: 2999,
    highlight: false,
    sortOrder: 2,
    status: 'Active',
    aiFeatures: DEFAULT_AI_FEATURES_BY_PLAN.Family,
    features: [
      'Everything in Plus',
      'Up to 5 family profiles',
      'Separate histories',
      'Shared grocery list',
      'Family goals dashboard',
    ],
  },
];

/** Convert legacy string prices + backfill aiFeatures. */
export async function normalizePlanPrices() {
  const plans = await Plan.find().lean();
  await Promise.all(
    plans.map(async (plan) => {
      const monthly = parsePriceAmount(plan.priceMonthly) ?? 0;
      const yearly = parsePriceAmount(plan.priceYearly);
      const hasAi = Array.isArray(plan.aiFeatures);
      const nextAi =
        hasAi && plan.aiFeatures.length
          ? normalizeAiFeatures(plan.aiFeatures)
          : DEFAULT_AI_FEATURES_BY_PLAN[plan.code] || [];

      const needsPrice =
        typeof plan.priceMonthly !== 'number' ||
        (plan.priceYearly != null &&
          plan.priceYearly !== '' &&
          typeof plan.priceYearly !== 'number');
      const needsAi = !hasAi || (!plan.aiFeatures.length && nextAi.length);

      if (!needsPrice && !needsAi) return;

      await Plan.updateOne(
        { _id: plan._id },
        {
          $set: {
            ...(needsPrice ? { priceMonthly: monthly, priceYearly: yearly } : {}),
            ...(needsAi ? { aiFeatures: nextAi } : {}),
          },
        }
      );
    })
  );
}

export async function ensureDefaultPlans() {
  const count = await Plan.countDocuments();
  if (count === 0) {
    await Plan.insertMany(DEFAULT_PLANS);
    return;
  }
  await normalizePlanPrices();
}
