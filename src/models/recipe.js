import mongoose from 'mongoose';

/**
 * Recipe catalog — Admin Recipes + APK Discover tab / Recipe detail.
 */
export const RECIPE_TAGS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Quick',
  'High protein',
  'Low carb',
  'Plant-based',
];

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    timeMinutes: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    ingredients: { type: [String], default: [] },
    steps: { type: [String], default: [] },
    imageUrl: { type: String, default: '', trim: true },
    imagePublicId: { type: String, default: '', trim: true },
    /** Shown as the big "Chef's pick" card on Discover. */
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

recipeSchema.index({ status: 1, createdAt: 1 });

recipeSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: String(this._id),
    title: this.title,
    description: this.description || '',
    timeMinutes: Number(this.timeMinutes) || 0,
    calories: Number(this.calories) || 0,
    protein: Number(this.protein) || 0,
    carbs: Number(this.carbs) || 0,
    fat: Number(this.fat) || 0,
    tags: Array.isArray(this.tags) ? this.tags : [],
    ingredients: Array.isArray(this.ingredients) ? this.ingredients : [],
    steps: Array.isArray(this.steps) ? this.steps : [],
    imageUrl: this.imageUrl || '',
    imagePublicId: this.imagePublicId || '',
    featured: Boolean(this.featured),
    status: this.status || 'Active',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/** Shape for Healthline APK Discover (matches old src/data/recipes.js). */
recipeSchema.methods.toAppJSON = function toAppJSON() {
  return {
    id: String(this._id),
    title: this.title,
    time: `${Number(this.timeMinutes) || 0} min`,
    calories: Number(this.calories) || 0,
    tags: Array.isArray(this.tags) ? this.tags : [],
    image: this.imageUrl || '',
    description: this.description || '',
    nutrition: {
      carbs: Number(this.carbs) || 0,
      protein: Number(this.protein) || 0,
      fat: Number(this.fat) || 0,
    },
    ingredients: Array.isArray(this.ingredients) ? this.ingredients : [],
    steps: Array.isArray(this.steps) ? this.steps : [],
    featured: Boolean(this.featured),
  };
};

export const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);

/** Seed — same 6 recipes the APK shipped with locally. */
export const DEFAULT_RECIPES = [
  {
    title: 'Avocado Toast with Eggs',
    timeMinutes: 12,
    calories: 420,
    tags: ['Breakfast', 'High protein'],
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900&q=80',
    description:
      'Creamy avocado on whole-grain toast topped with a runny egg — balanced fats, fiber, and protein to start your day.',
    carbs: 28,
    protein: 22,
    fat: 24,
    ingredients: [
      '2 slices whole-grain bread',
      '1 ripe avocado',
      '2 eggs',
      '1 tsp olive oil',
      'Salt, pepper, chili flakes',
    ],
    steps: [
      'Toast bread until golden.',
      'Mash avocado with salt and pepper; spread on toast.',
      'Fry eggs in olive oil to your liking.',
      'Top toast with eggs and chili flakes. Serve warm.',
    ],
    featured: true,
  },
  {
    title: 'Greek Yogurt Berry Bowl',
    timeMinutes: 5,
    calories: 280,
    tags: ['Breakfast', 'Quick'],
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=900&q=80',
    description: 'Thick Greek yogurt layered with mixed berries, honey, and crunchy granola.',
    carbs: 38,
    protein: 18,
    fat: 8,
    ingredients: ['1 cup Greek yogurt (0%)', '1/2 cup mixed berries', '2 tbsp granola', '1 tsp honey'],
    steps: ['Add yogurt to a bowl.', 'Top with berries and granola.', 'Drizzle honey and serve immediately.'],
  },
  {
    title: 'Grilled Salmon & Greens',
    timeMinutes: 25,
    calories: 510,
    tags: ['Dinner', 'Low carb'],
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=900&q=80',
    description:
      'Pan-seared salmon over lemon-dressed greens — high protein, omega-3s, and minimal carbs.',
    carbs: 12,
    protein: 42,
    fat: 32,
    ingredients: [
      '180 g salmon fillet',
      '2 cups mixed greens',
      '1 tbsp olive oil',
      '1/2 lemon, juice',
      'Garlic, salt, pepper',
    ],
    steps: [
      'Season salmon; sear 4 min per side in olive oil.',
      'Toss greens with lemon juice, garlic, salt, and pepper.',
      'Plate greens, top with salmon, and serve.',
    ],
  },
  {
    title: 'Rainbow Veggie Bowl',
    timeMinutes: 20,
    calories: 390,
    tags: ['Lunch', 'Plant-based'],
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80',
    description:
      'Colorful roasted vegetables over quinoa with tahini drizzle — filling and fiber-rich.',
    carbs: 52,
    protein: 14,
    fat: 16,
    ingredients: [
      '1 cup cooked quinoa',
      '1 cup roasted vegetables',
      '2 tbsp tahini',
      '1 tbsp lemon juice',
      'Fresh herbs',
    ],
    steps: [
      'Roast chopped vegetables at 200°C for 18 min.',
      'Warm quinoa and divide into bowls.',
      'Top with veggies; drizzle tahini and lemon.',
    ],
  },
  {
    title: 'Berry Protein Smoothie',
    timeMinutes: 6,
    calories: 240,
    tags: ['Snack', 'Quick'],
    imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=900&q=80',
    description:
      'Blended berries, banana, and protein powder — a fast post-workout or afternoon snack.',
    carbs: 32,
    protein: 24,
    fat: 4,
    ingredients: [
      '1 scoop vanilla protein',
      '1/2 cup frozen berries',
      '1/2 banana',
      '1 cup almond milk',
      'Ice cubes',
    ],
    steps: [
      'Add all ingredients to a blender.',
      'Blend until smooth, 30–45 seconds.',
      'Pour and enjoy cold.',
    ],
  },
  {
    title: 'Chicken Quinoa Plate',
    timeMinutes: 30,
    calories: 480,
    tags: ['Lunch', 'High protein'],
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a532c81cd57d?w=900&q=80',
    description:
      'Grilled chicken breast with herbed quinoa and steamed broccoli — a classic meal-prep plate.',
    carbs: 44,
    protein: 38,
    fat: 14,
    ingredients: [
      '150 g chicken breast',
      '3/4 cup cooked quinoa',
      '1 cup broccoli florets',
      '1 tsp olive oil',
      'Herbs, garlic, salt',
    ],
    steps: [
      'Grill seasoned chicken until cooked through.',
      'Steam broccoli 4–5 minutes.',
      'Serve chicken over quinoa with broccoli on the side.',
    ],
  },
];

export async function ensureDefaultRecipes() {
  const count = await Recipe.countDocuments();
  if (count > 0) return;
  await Recipe.insertMany(DEFAULT_RECIPES.map((item) => ({ ...item, status: 'Active' })));
}

/** Tags keep their case (APK filters match 'Breakfast', 'High protein', …). */
export function normalizeRecipeTags(value) {
  const list = Array.isArray(value) ? value : String(value || '').split(',');
  return [...new Set(list.map((t) => String(t || '').trim()).filter(Boolean))];
}

/** One item per line (ingredients / steps). */
export function normalizeLines(value) {
  const list = Array.isArray(value) ? value : String(value || '').split('\n');
  return list.map((t) => String(t || '').trim()).filter(Boolean);
}

export function parseNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Shared by POST / PUT: only fields present in `body` are returned. */
export function recipeFieldsFromBody(body) {
  const out = {};
  if (body.title !== undefined) out.title = String(body.title || '').trim();
  if (body.description !== undefined) out.description = String(body.description || '').trim();
  if (body.timeMinutes !== undefined) out.timeMinutes = parseNumber(body.timeMinutes);
  if (body.calories !== undefined) out.calories = parseNumber(body.calories);
  if (body.protein !== undefined) out.protein = parseNumber(body.protein);
  if (body.carbs !== undefined) out.carbs = parseNumber(body.carbs);
  if (body.fat !== undefined) out.fat = parseNumber(body.fat);
  if (body.tags !== undefined) out.tags = normalizeRecipeTags(body.tags);
  if (body.ingredients !== undefined) out.ingredients = normalizeLines(body.ingredients);
  if (body.steps !== undefined) out.steps = normalizeLines(body.steps);
  if (body.imageUrl !== undefined) out.imageUrl = String(body.imageUrl || '').trim();
  if (body.imagePublicId !== undefined) out.imagePublicId = String(body.imagePublicId || '').trim();
  if (body.featured !== undefined) out.featured = body.featured === true;
  if (body.status === 'Active' || body.status === 'Inactive') out.status = body.status;
  return out;
}
