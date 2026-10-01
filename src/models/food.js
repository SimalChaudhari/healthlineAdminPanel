import mongoose from 'mongoose';

/**
 * Food catalog — Admin Food Database + APK Diary search/log.
 */
const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: '', trim: true },
    serving: { type: String, default: '1 serving', trim: true },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    cuisine: { type: String, default: '', trim: true },
    category: { type: String, default: '', trim: true },
    tags: { type: [String], default: [] },
    barcode: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '', trim: true },
    imagePublicId: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected', 'Archived'],
      default: 'Approved',
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

foodSchema.index({ name: 'text', brand: 'text', tags: 'text' });
foodSchema.index({ barcode: 1 });
foodSchema.index({ status: 1, sortOrder: 1 });

foodSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: String(this._id),
    name: this.name,
    brand: this.brand || '',
    serving: this.serving || '1 serving',
    calories: Number(this.calories) || 0,
    protein: Number(this.protein) || 0,
    carbs: Number(this.carbs) || 0,
    fat: Number(this.fat) || 0,
    fiber: Number(this.fiber) || 0,
    sugar: Number(this.sugar) || 0,
    sodium: Number(this.sodium) || 0,
    cuisine: this.cuisine || '',
    category: this.category || '',
    tags: Array.isArray(this.tags) ? this.tags : [],
    barcode: this.barcode || '',
    imageUrl: this.imageUrl || '',
    imagePublicId: this.imagePublicId || '',
    status: this.status || 'Approved',
    sortOrder: this.sortOrder ?? 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/** Shape for Healthline APK diary search / log. */
foodSchema.methods.toAppJSON = function toAppJSON() {
  return {
    id: String(this._id),
    name: this.name,
    brand: this.brand || '',
    serving: this.serving || '1 serving',
    calories: Number(this.calories) || 0,
    carbs: Number(this.carbs) || 0,
    protein: Number(this.protein) || 0,
    fat: Number(this.fat) || 0,
    fiber: Number(this.fiber) || 0,
    sugar: Number(this.sugar) || 0,
    sodium: Number(this.sodium) || 0,
    tags: Array.isArray(this.tags) ? this.tags : [],
    barcode: this.barcode || '',
    imageUrl: this.imageUrl || '',
  };
};

export const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

/** Demo stock photos (Unsplash) — admin can replace via Cloudinary upload. */
const FOOD_IMAGES = {
  'Kirkland Greek Yogurt':
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop',
  Honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop',
  'Red Grapes':
    'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&auto=format&fit=crop',
  'Avocado Toast':
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop',
  'Oatmeal with Banana':
    'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&auto=format&fit=crop',
  'Grilled Chicken Breast':
    'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&auto=format&fit=crop',
  'Quinoa Salad':
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&auto=format&fit=crop',
  'Salmon with Broccoli':
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&auto=format&fit=crop',
  'Protein Shake':
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&auto=format&fit=crop',
  Almonds: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&auto=format&fit=crop',
  'Iced Latte':
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&auto=format&fit=crop',
  'Brown Rice':
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop',
  Banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop',
  'Eggs, scrambled':
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop',
  'Caesar Salad':
    'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&auto=format&fit=crop',
  Paneer: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop',
  Roti: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop',
  'Dal Tadka':
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop',
  'Masala Dosa':
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop',
  'Greek Yogurt':
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop',
};

function withFoodImage(item) {
  const imageUrl = item.imageUrl || FOOD_IMAGES[item.name] || '';
  return imageUrl ? { ...item, imageUrl } : item;
}

/** Seed catalog — APK demo foods + Indian staples. */
export const DEFAULT_FOODS = [
  {
    name: 'Kirkland Greek Yogurt',
    brand: 'Kirkland',
    barcode: 'DEMO-0001',
    serving: '1 cup (227g)',
    calories: 130,
    carbs: 8,
    protein: 22,
    fat: 0,
    tags: ['breakfast', 'high-protein'],
    cuisine: 'Global',
    category: 'Dairy',
    status: 'Approved',
    sortOrder: 0,
  },
  {
    name: 'Honey',
    brand: 'Generic',
    serving: '1 tbsp (21g)',
    calories: 64,
    carbs: 17,
    protein: 0,
    fat: 0,
    tags: ['condiment'],
    cuisine: 'Global',
    category: 'Condiment',
    status: 'Approved',
    sortOrder: 1,
  },
  {
    name: 'Red Grapes',
    brand: 'Fresh',
    serving: '1 cup (151g)',
    calories: 104,
    carbs: 27,
    protein: 1,
    fat: 0,
    tags: ['fruit', 'snack'],
    cuisine: 'Global',
    category: 'Fruit',
    status: 'Approved',
    sortOrder: 2,
  },
  {
    name: 'Avocado Toast',
    brand: 'Homemade',
    serving: '1 slice',
    calories: 290,
    carbs: 28,
    protein: 8,
    fat: 16,
    tags: ['breakfast'],
    cuisine: 'Global',
    category: 'Meal',
    status: 'Approved',
    sortOrder: 3,
  },
  {
    name: 'Oatmeal with Banana',
    brand: 'Homemade',
    serving: '1 bowl',
    calories: 320,
    carbs: 58,
    protein: 10,
    fat: 6,
    tags: ['breakfast'],
    cuisine: 'Global',
    category: 'Meal',
    status: 'Approved',
    sortOrder: 4,
  },
  {
    name: 'Grilled Chicken Breast',
    brand: 'Generic',
    serving: '150g',
    calories: 248,
    carbs: 0,
    protein: 46,
    fat: 5,
    tags: ['lunch', 'dinner', 'high-protein'],
    cuisine: 'Global',
    category: 'Protein',
    status: 'Approved',
    sortOrder: 5,
  },
  {
    name: 'Quinoa Salad',
    brand: 'Homemade',
    serving: '1 bowl',
    calories: 380,
    carbs: 48,
    protein: 14,
    fat: 14,
    tags: ['lunch'],
    cuisine: 'Global',
    category: 'Meal',
    status: 'Approved',
    sortOrder: 6,
  },
  {
    name: 'Salmon with Broccoli',
    brand: 'Homemade',
    serving: '1 plate',
    calories: 420,
    carbs: 12,
    protein: 38,
    fat: 24,
    tags: ['dinner'],
    cuisine: 'Global',
    category: 'Meal',
    status: 'Approved',
    sortOrder: 7,
  },
  {
    name: 'Protein Shake',
    brand: 'Generic',
    serving: '1 scoop + water',
    calories: 140,
    carbs: 4,
    protein: 25,
    fat: 2,
    tags: ['snack', 'high-protein'],
    cuisine: 'Global',
    category: 'Drink',
    status: 'Approved',
    sortOrder: 8,
  },
  {
    name: 'Almonds',
    brand: 'Generic',
    serving: '28g (23 nuts)',
    calories: 164,
    carbs: 6,
    protein: 6,
    fat: 14,
    tags: ['snack'],
    cuisine: 'Global',
    category: 'Nuts',
    status: 'Approved',
    sortOrder: 9,
  },
  {
    name: 'Iced Latte',
    brand: 'Cafe',
    serving: '16 oz',
    calories: 120,
    carbs: 14,
    protein: 8,
    fat: 3,
    tags: ['drink'],
    cuisine: 'Global',
    category: 'Drink',
    status: 'Approved',
    sortOrder: 10,
  },
  {
    name: 'Brown Rice',
    brand: 'Generic',
    serving: '1 cup cooked',
    calories: 216,
    carbs: 45,
    protein: 5,
    fat: 2,
    tags: ['lunch', 'dinner'],
    cuisine: 'Global',
    category: 'Grains',
    status: 'Approved',
    sortOrder: 11,
  },
  {
    name: 'Banana',
    brand: 'Fresh',
    serving: '1 medium',
    calories: 105,
    carbs: 27,
    protein: 1,
    fat: 0,
    tags: ['fruit', 'snack'],
    cuisine: 'Global',
    category: 'Fruit',
    status: 'Approved',
    sortOrder: 12,
  },
  {
    name: 'Eggs, scrambled',
    brand: 'Homemade',
    serving: '2 large',
    calories: 182,
    carbs: 2,
    protein: 12,
    fat: 14,
    tags: ['breakfast'],
    cuisine: 'Global',
    category: 'Protein',
    status: 'Approved',
    sortOrder: 13,
  },
  {
    name: 'Caesar Salad',
    brand: 'Restaurant',
    serving: '1 bowl',
    calories: 360,
    carbs: 18,
    protein: 12,
    fat: 28,
    tags: ['lunch'],
    cuisine: 'Global',
    category: 'Meal',
    status: 'Approved',
    sortOrder: 14,
  },
  {
    name: 'Paneer',
    brand: 'Generic',
    serving: '100g',
    calories: 265,
    protein: 18,
    carbs: 1.2,
    fat: 20,
    tags: ['high-protein', 'indian'],
    cuisine: 'Indian',
    category: 'Dairy',
    status: 'Approved',
    sortOrder: 15,
  },
  {
    name: 'Roti',
    brand: 'Homemade',
    serving: '1 piece',
    calories: 120,
    protein: 3.5,
    carbs: 22,
    fat: 2,
    tags: ['indian', 'lunch', 'dinner'],
    cuisine: 'Indian',
    category: 'Grains',
    status: 'Approved',
    sortOrder: 16,
  },
  {
    name: 'Dal Tadka',
    brand: 'Homemade',
    serving: '1 bowl',
    calories: 180,
    protein: 9,
    carbs: 24,
    fat: 5,
    tags: ['indian', 'lunch', 'dinner'],
    cuisine: 'Indian',
    category: 'Protein',
    status: 'Approved',
    sortOrder: 17,
  },
  {
    name: 'Masala Dosa',
    brand: 'Restaurant',
    serving: '1 plate',
    calories: 350,
    protein: 8,
    carbs: 48,
    fat: 12,
    tags: ['south-indian', 'breakfast'],
    cuisine: 'South Indian',
    category: 'Meal',
    status: 'Approved',
    sortOrder: 18,
  },
  {
    name: 'Greek Yogurt',
    brand: 'Generic',
    serving: '100g',
    calories: 97,
    protein: 9,
    carbs: 3.6,
    fat: 5,
    tags: ['breakfast', 'high-protein'],
    cuisine: 'Global',
    category: 'Dairy',
    status: 'Approved',
    sortOrder: 19,
  },
].map(withFoodImage);

export async function ensureDefaultFoods() {
  const count = await Food.countDocuments();
  if (count === 0) {
    await Food.insertMany(DEFAULT_FOODS);
    return;
  }

  // Backfill demo images on existing catalog rows that have none
  for (const [name, imageUrl] of Object.entries(FOOD_IMAGES)) {
    await Food.updateMany(
      { name, $or: [{ imageUrl: { $exists: false } }, { imageUrl: '' }, { imageUrl: null }] },
      { $set: { imageUrl } }
    );
  }
}

export function normalizeTags(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((t) => String(t || '').trim().toLowerCase()).filter(Boolean))];
  }
  return String(value || '')
    .split(/[,\n]/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export function parseMacro(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
