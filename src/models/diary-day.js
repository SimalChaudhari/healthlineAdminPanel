import mongoose from 'mongoose';

const foodEntrySchema = new mongoose.Schema(
  {
    logId: { type: String, required: true },
    foodId: { type: String, default: '' },
    name: { type: String, default: '' },
    serving: { type: String, default: '' },
    calories: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
  },
  { _id: false }
);

const exerciseEntrySchema = new mongoose.Schema(
  {
    logId: { type: String, required: true },
    name: { type: String, default: '' },
    minutes: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
  },
  { _id: false }
);

/** One user's diary for one local calendar day (YYYY-MM-DD). */
const diaryDaySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    meals: {
      breakfast: { type: [foodEntrySchema], default: [] },
      lunch: { type: [foodEntrySchema], default: [] },
      dinner: { type: [foodEntrySchema], default: [] },
      snacks: { type: [foodEntrySchema], default: [] },
    },
    exercise: { type: [exerciseEntrySchema], default: [] },
    water: { type: Number, default: 0 },
  },
  { timestamps: true }
);

diaryDaySchema.index({ user: 1, date: 1 }, { unique: true });

diaryDaySchema.methods.toPublicJSON = function toPublicJSON() {
  const meals = this.meals || {};
  return {
    date: this.date,
    meals: {
      breakfast: meals.breakfast || [],
      lunch: meals.lunch || [],
      dinner: meals.dinner || [],
      snacks: meals.snacks || [],
    },
    exercise: this.exercise || [],
    water: this.water || 0,
    updatedAt: this.updatedAt,
  };
};

export const DiaryDay =
  mongoose.models.DiaryDay || mongoose.model('DiaryDay', diaryDaySchema);
