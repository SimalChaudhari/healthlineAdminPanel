/** Validation for diary writes coming from the app. */

export const MEAL_KEYS = ['breakfast', 'lunch', 'dinner', 'snacks'];
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const MAX_ITEMS_PER_MEAL = 50;
const MAX_EXERCISE = 30;
const MAX_WATER = 50;

function str(value, max = 120) {
  return String(value ?? '')
    .trim()
    .slice(0, max);
}

function num(value, max = 100000) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n * 10) / 10, max);
}

const FOOD_SOURCES = ['ai-scan', 'ai-voice', 'barcode'];

function sanitizeFood(item) {
  return {
    logId: str(item?.logId, 64),
    foodId: str(item?.foodId, 64),
    name: str(item?.name),
    serving: str(item?.serving, 60),
    calories: num(item?.calories, 20000),
    carbs: num(item?.carbs, 5000),
    protein: num(item?.protein, 5000),
    fat: num(item?.fat, 5000),
    fiber: num(item?.fiber, 5000),
    sugar: num(item?.sugar, 5000),
    sodium: num(item?.sodium, 100000),
    // How it was logged — 'ai-scan' / 'ai-voice' count toward the Mindful eat achievement.
    source: FOOD_SOURCES.includes(item?.source) ? item.source : '',
  };
}

function sanitizeExercise(item) {
  return {
    logId: str(item?.logId, 64),
    name: str(item?.name),
    minutes: num(item?.minutes, 1440),
    calories: num(item?.calories, 20000),
  };
}

/** Normalise a client day payload; drops entries without a logId. */
export function sanitizeDiaryDay(input = {}) {
  const mealsIn = input.meals && typeof input.meals === 'object' ? input.meals : {};
  const meals = {};
  MEAL_KEYS.forEach((key) => {
    const list = Array.isArray(mealsIn[key]) ? mealsIn[key] : [];
    meals[key] = list
      .slice(0, MAX_ITEMS_PER_MEAL)
      .map(sanitizeFood)
      .filter((f) => f.logId);
  });

  const exercise = (Array.isArray(input.exercise) ? input.exercise : [])
    .slice(0, MAX_EXERCISE)
    .map(sanitizeExercise)
    .filter((e) => e.logId);

  return { meals, exercise, water: Math.round(num(input.water, MAX_WATER)) };
}
