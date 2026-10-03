import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  const text = readFileSync(envPath, 'utf8');

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const index = trimmed.indexOf('=');
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const MONGODB_URL = process.env.MONGODB_URL;
const DB_NAME = process.env.DB_NAME || 'healthline';

if (!MONGODB_URL) {
  throw new Error('MONGODB_URL is not set');
}

function configureCloudinary() {
  const url = process.env.CLOUDINARY_URL || '';
  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/]+)/i);
  const cloud_name = match?.[3] || process.env.CLOUDINARY_CLOUD_NAME || '';
  const api_key = match?.[1] || process.env.CLOUDINARY_API_KEY || '';
  const api_secret = match?.[2] || process.env.CLOUDINARY_API_SECRET || '';
  if (!cloud_name || !api_key || !api_secret) return false;
  cloudinary.config({ cloud_name, api_key, api_secret });
  return true;
}

function foodsCloudFolder() {
  const root = String(process.env.CLOUDINARY_FOLDER || 'healthline').replace(/^\/+|\/+$/g, '');
  return `${root}/foods`;
}

/** Upload remote image to Cloudinary; returns { url, publicId } or null. */
async function hostFoodImageOnCloudinary(remoteUrl, publicIdHint = '') {
  if (!remoteUrl || String(remoteUrl).includes('cloudinary.com')) {
    return remoteUrl
      ? { url: remoteUrl, publicId: '' }
      : null;
  }
  const folder = foodsCloudFolder();
  const options = {
    folder,
    resource_type: 'image',
    overwrite: true,
    invalidate: true,
  };
  if (publicIdHint) options.public_id = publicIdHint;
  const result = await cloudinary.uploader.upload(remoteUrl, options);
  return { url: result.secure_url, publicId: result.public_id };
}

const User =
  mongoose.models.User ||
  mongoose.model(
    'User',
    new mongoose.Schema(
      {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        firstName: { type: String, default: '', trim: true },
        lastName: { type: String, default: '', trim: true },
        displayName: { type: String, default: '', trim: true },
        role: { type: String, enum: ['admin', 'user'], default: 'user' },
        plan: { type: String, enum: ['Free', 'Plus', 'Family'], default: 'Free' },
        status: { type: String, enum: ['Active', 'Trial', 'Blocked'], default: 'Active' },
        photoURL: { type: String, default: '' },
        phoneNumber: { type: String, default: '' },
      },
      { timestamps: true }
    )
  );

async function seedUsers() {
  const items = [
    {
      email: process.env.SEED_ADMIN_EMAIL || 'admin@healthline.local',
      // No default: a password in a public repo is a public password. Set SEED_ADMIN_PASSWORD in .env.
      password: process.env.SEED_ADMIN_PASSWORD,
      firstName: 'Health',
      lastName: 'Admin',
      displayName: 'Health Admin',
      role: 'admin',
      plan: 'Plus',
      status: 'Active',
    },
    {
      email: process.env.SEED_USER_EMAIL || 'user@healthline.local',
      password: process.env.SEED_USER_PASSWORD,
      firstName: 'Demo',
      lastName: 'User',
      displayName: 'Demo User',
      role: 'user',
      plan: 'Free',
      status: 'Active',
    },
  ];

  for (const item of items) {
    const email = item.email.trim().toLowerCase();
    const existing = await User.findOne({ email });

    if (!existing && !item.password) {
      console.log(`- users: ${email} skipped — set ${item.role === 'admin' ? 'SEED_ADMIN_PASSWORD' : 'SEED_USER_PASSWORD'} in .env to create it`);
      continue;
    }

    await User.updateOne(
      { email },
      {
        // Password only on first create — re-running the seed must never reset a changed password.
        $setOnInsert: { password: await bcrypt.hash(item.password || '', 10) },
        $set: {
          email,
          firstName: item.firstName,
          lastName: item.lastName,
          displayName: item.displayName,
          role: item.role,
          plan: item.plan,
          status: item.status,
        },
      },
      { upsert: true }
    );

    console.log(`- users: ${email} (${item.role}/${item.plan}/${item.status}) ${existing ? 'updated' : 'created'}`);
  }
}

async function seedFeatures() {
  const Feature =
    mongoose.models.Feature ||
    mongoose.model(
      'Feature',
      new mongoose.Schema(
        {
          key: { type: String, required: true, unique: true, trim: true },
          label: { type: String, required: true, trim: true },
          description: { type: String, default: '' },
          icon: { type: String, default: '' },
          color: { type: String, default: '#0070E0' },
          route: { type: String, default: '' },
          routeParams: { type: mongoose.Schema.Types.Mixed, default: null },
          aiKey: { type: String, default: '' },
          showInHub: { type: Boolean, default: true },
          status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
          sortOrder: { type: Number, default: 0 },
        },
        { timestamps: true }
      )
    );

  const defaults = [
    { key: 'food', label: 'Food Tracking', icon: 'UtensilsCrossed', color: '#FF9800', route: 'AddFood', routeParams: { meal: 'breakfast' }, aiKey: '', showInHub: true, sortOrder: 0 },
    { key: 'scan', label: 'Meal Scanner', icon: 'ScanLine', color: '#03A9F4', route: 'ScanFood', routeParams: { meal: 'lunch' }, aiKey: 'mealScanner', showInHub: true, sortOrder: 1 },
    { key: 'cal', label: 'Calorie Counter', icon: 'Flame', color: '#F06292', route: 'Diary', aiKey: '', showInHub: true, sortOrder: 2 },
    { key: 'macro', label: 'Macro Tracking', icon: 'PieChart', color: '#9B59B6', route: 'Progress', aiKey: '', showInHub: true, sortOrder: 3 },
    { key: 'water', label: 'Water Tracker', icon: 'Droplets', color: '#26C6DA', route: 'Dashboard', aiKey: '', showInHub: true, sortOrder: 4 },
    { key: 'exercise', label: 'Exercise Log', icon: 'Dumbbell', color: '#66BB6A', route: 'LogExercise', routeParams: {}, aiKey: '', showInHub: true, sortOrder: 5 },
    { key: 'weight', label: 'Weight Tracker', icon: 'Scale', color: '#FFCA28', route: 'LogWeight', aiKey: '', showInHub: true, sortOrder: 6 },
    { key: 'charts', label: 'Progress Charts', icon: 'ChartLine', color: '#7986CB', route: 'Progress', aiKey: '', showInHub: true, sortOrder: 7 },
    { key: 'recipes', label: 'Healthy Recipes', icon: 'Salad', color: '#9CCC65', route: 'Discover', aiKey: '', showInHub: true, sortOrder: 8 },
    { key: 'planner', label: 'Meal Planner', icon: 'CalendarDays', color: '#FF7043', route: 'MealPlan', aiKey: '', showInHub: true, sortOrder: 9 },
    { key: 'coach', label: 'AI Nutrition Coach', icon: 'Sparkles', color: '#0984E3', route: 'Coach', aiKey: 'aiCoach', showInHub: true, sortOrder: 10 },
    { key: 'reminders', label: 'Reminders', icon: 'Bell', color: '#FD79A8', route: 'Reminders', aiKey: '', showInHub: true, sortOrder: 11 },
    { key: 'barcode', label: 'Barcode Scan', icon: 'Barcode', color: '#FFCA28', route: 'BarcodeScan', routeParams: { meal: 'snacks' }, aiKey: 'barcodeScan', showInHub: true, sortOrder: 12 },
    { key: 'voiceLog', label: 'Voice Logging', icon: 'Mic', color: '#6C5CE7', route: 'VoiceLog', routeParams: { meal: 'snacks' }, aiKey: 'voiceLog', showInHub: false, sortOrder: 13 },
    { key: 'workoutAi', label: 'Workout AI', icon: 'Dumbbell', color: '#2ECC71', route: 'Programs', aiKey: 'workoutAi', showInHub: false, sortOrder: 14 },
    { key: 'medicalAi', label: 'Medical AI', icon: 'HeartPulse', color: '#FF3B30', route: '', aiKey: 'medicalAi', showInHub: false, status: 'Inactive', sortOrder: 15 },
  ];

  for (const item of defaults) {
    const existing = await Feature.findOne({ key: item.key });
    await Feature.updateOne(
      { key: item.key },
      {
        $set: {
          ...item,
          description: item.description || '',
          status: item.status || 'Active',
        },
      },
      { upsert: true }
    );
    console.log(`- features: ${item.key} (${item.label}) ${existing ? 'updated' : 'created'}`);
  }
}

async function seedFoods() {
  const Food =
    mongoose.models.Food ||
    mongoose.model(
      'Food',
      new mongoose.Schema(
        {
          name: { type: String, required: true, trim: true },
          brand: { type: String, default: '' },
          serving: { type: String, default: '1 serving' },
          calories: { type: Number, default: 0 },
          protein: { type: Number, default: 0 },
          carbs: { type: Number, default: 0 },
          fat: { type: Number, default: 0 },
          fiber: { type: Number, default: 0 },
          sugar: { type: Number, default: 0 },
          sodium: { type: Number, default: 0 },
          cuisine: { type: String, default: '' },
          category: { type: String, default: '' },
          tags: { type: [String], default: [] },
          barcode: { type: String, default: '' },
          imageUrl: { type: String, default: '' },
          imagePublicId: { type: String, default: '' },
          status: {
            type: String,
            enum: ['Approved', 'Pending', 'Rejected', 'Archived'],
            default: 'Approved',
          },
          sortOrder: { type: Number, default: 0 },
        },
        { timestamps: true }
      )
    );

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

  const count = await Food.countDocuments();
  const hasCloudinary = configureCloudinary();

  async function resolveImage(name, fallbackUrl = '') {
    const source = FOOD_IMAGES[name] || fallbackUrl || '';
    if (!source) return { imageUrl: '', imagePublicId: '' };
    if (!hasCloudinary) return { imageUrl: source, imagePublicId: '' };
    try {
      const slug = String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const hosted = await hostFoodImageOnCloudinary(source, slug);
      return {
        imageUrl: hosted?.url || source,
        imagePublicId: hosted?.publicId || '',
      };
    } catch (err) {
      console.warn(`  ! cloudinary skip "${name}": ${err.message}`);
      return { imageUrl: source, imagePublicId: '' };
    }
  }

  if (count > 0) {
    let patched = 0;
    let hosted = 0;
    const foods = await Food.find({});
    for (const food of foods) {
      const url = food.imageUrl || FOOD_IMAGES[food.name] || '';
      if (!url) continue;

      // Already on Cloudinary
      if (String(url).includes('cloudinary.com')) {
        if (!food.imagePublicId) {
          // keep url; public id optional
        }
        continue;
      }

      if (hasCloudinary) {
        const img = await resolveImage(food.name, url || FOOD_IMAGES[food.name]);
        if (img.imageUrl && String(img.imageUrl).includes('cloudinary.com')) {
          food.imageUrl = img.imageUrl;
          food.imagePublicId = img.imagePublicId;
          await food.save();
          hosted += 1;
          patched += 1;
        } else if (!food.imageUrl && FOOD_IMAGES[food.name]) {
          food.imageUrl = FOOD_IMAGES[food.name];
          await food.save();
          patched += 1;
        }
        continue;
      }
    }
    console.log(
      `- foods: ${count} exist` +
        (hosted ? `; uploaded ${hosted} images to Cloudinary` : '') +
        (patched && !hosted ? `; backfilled ${patched} image URLs` : '') +
        (!hasCloudinary ? ' (Cloudinary not configured — keeping remote URLs)' : '')
    );
    return;
  }

  const defaults = [
    { name: 'Kirkland Greek Yogurt', brand: 'Kirkland', barcode: 'DEMO-0001', serving: '1 cup (227g)', calories: 130, carbs: 8, protein: 22, fat: 0, tags: ['breakfast', 'high-protein'], cuisine: 'Global', category: 'Dairy', sortOrder: 0 },
    { name: 'Honey', brand: 'Generic', serving: '1 tbsp (21g)', calories: 64, carbs: 17, protein: 0, fat: 0, tags: ['condiment'], cuisine: 'Global', category: 'Condiment', sortOrder: 1 },
    { name: 'Red Grapes', brand: 'Fresh', serving: '1 cup (151g)', calories: 104, carbs: 27, protein: 1, fat: 0, tags: ['fruit', 'snack'], cuisine: 'Global', category: 'Fruit', sortOrder: 2 },
    { name: 'Avocado Toast', brand: 'Homemade', serving: '1 slice', calories: 290, carbs: 28, protein: 8, fat: 16, tags: ['breakfast'], cuisine: 'Global', category: 'Meal', sortOrder: 3 },
    { name: 'Oatmeal with Banana', brand: 'Homemade', serving: '1 bowl', calories: 320, carbs: 58, protein: 10, fat: 6, tags: ['breakfast'], cuisine: 'Global', category: 'Meal', sortOrder: 4 },
    { name: 'Grilled Chicken Breast', brand: 'Generic', serving: '150g', calories: 248, carbs: 0, protein: 46, fat: 5, tags: ['lunch', 'dinner', 'high-protein'], cuisine: 'Global', category: 'Protein', sortOrder: 5 },
    { name: 'Quinoa Salad', brand: 'Homemade', serving: '1 bowl', calories: 380, carbs: 48, protein: 14, fat: 14, tags: ['lunch'], cuisine: 'Global', category: 'Meal', sortOrder: 6 },
    { name: 'Salmon with Broccoli', brand: 'Homemade', serving: '1 plate', calories: 420, carbs: 12, protein: 38, fat: 24, tags: ['dinner'], cuisine: 'Global', category: 'Meal', sortOrder: 7 },
    { name: 'Protein Shake', brand: 'Generic', serving: '1 scoop + water', calories: 140, carbs: 4, protein: 25, fat: 2, tags: ['snack', 'high-protein'], cuisine: 'Global', category: 'Drink', sortOrder: 8 },
    { name: 'Almonds', brand: 'Generic', serving: '28g (23 nuts)', calories: 164, carbs: 6, protein: 6, fat: 14, tags: ['snack'], cuisine: 'Global', category: 'Nuts', sortOrder: 9 },
    { name: 'Iced Latte', brand: 'Cafe', serving: '16 oz', calories: 120, carbs: 14, protein: 8, fat: 3, tags: ['drink'], cuisine: 'Global', category: 'Drink', sortOrder: 10 },
    { name: 'Brown Rice', brand: 'Generic', serving: '1 cup cooked', calories: 216, carbs: 45, protein: 5, fat: 2, tags: ['lunch', 'dinner'], cuisine: 'Global', category: 'Grains', sortOrder: 11 },
    { name: 'Banana', brand: 'Fresh', serving: '1 medium', calories: 105, carbs: 27, protein: 1, fat: 0, tags: ['fruit', 'snack'], cuisine: 'Global', category: 'Fruit', sortOrder: 12 },
    { name: 'Eggs, scrambled', brand: 'Homemade', serving: '2 large', calories: 182, carbs: 2, protein: 12, fat: 14, tags: ['breakfast'], cuisine: 'Global', category: 'Protein', sortOrder: 13 },
    { name: 'Caesar Salad', brand: 'Restaurant', serving: '1 bowl', calories: 360, carbs: 18, protein: 12, fat: 28, tags: ['lunch'], cuisine: 'Global', category: 'Meal', sortOrder: 14 },
    { name: 'Paneer', brand: 'Generic', serving: '100g', calories: 265, protein: 18, carbs: 1.2, fat: 20, tags: ['high-protein', 'indian'], cuisine: 'Indian', category: 'Dairy', sortOrder: 15 },
    { name: 'Roti', brand: 'Homemade', serving: '1 piece', calories: 120, protein: 3.5, carbs: 22, fat: 2, tags: ['indian', 'lunch', 'dinner'], cuisine: 'Indian', category: 'Grains', sortOrder: 16 },
    { name: 'Dal Tadka', brand: 'Homemade', serving: '1 bowl', calories: 180, protein: 9, carbs: 24, fat: 5, tags: ['indian', 'lunch', 'dinner'], cuisine: 'Indian', category: 'Protein', sortOrder: 17 },
    { name: 'Masala Dosa', brand: 'Restaurant', serving: '1 plate', calories: 350, protein: 8, carbs: 48, fat: 12, tags: ['south-indian', 'breakfast'], cuisine: 'South Indian', category: 'Meal', sortOrder: 18 },
    { name: 'Greek Yogurt', brand: 'Generic', serving: '100g', calories: 97, protein: 9, carbs: 3.6, fat: 5, tags: ['breakfast', 'high-protein'], cuisine: 'Global', category: 'Dairy', sortOrder: 19 },
  ];

  const docs = [];
  for (const item of defaults) {
    const img = await resolveImage(item.name, FOOD_IMAGES[item.name]);
    docs.push({
      ...item,
      status: 'Approved',
      imageUrl: img.imageUrl,
      imagePublicId: img.imagePublicId,
    });
  }

  await Food.insertMany(docs);
  console.log(
    `- foods: inserted ${docs.length} items` +
      (hasCloudinary ? ' (images on Cloudinary)' : ' (Cloudinary not configured)')
  );
}

/** App reminders (Notifications → App reminders). Resets each default to its seed values. */
async function seedReminders() {
  // Same list the API seeds on first load, so the defaults live in one place.
  const { ReminderSetting, DEFAULT_REMINDERS } = await import('../src/models/reminder-setting.js');

  for (const item of DEFAULT_REMINDERS) {
    const existing = await ReminderSetting.findOne({ key: item.key });
    await ReminderSetting.updateOne(
      { key: item.key },
      { $set: item, $unset: { weekday: '' } },
      { upsert: true }
    );
    console.log(`- reminders: ${item.key} (${item.label}) ${existing ? 'reset' : 'created'}`);
  }
}

// Add more collections here later, e.g. seedReports, seedLabs
const SEEDERS = [
  { name: 'users', run: seedUsers },
  { name: 'features', run: seedFeatures },
  { name: 'reminders', run: seedReminders },
  { name: 'foods', run: seedFoods },
];

async function seed() {
  await mongoose.connect(MONGODB_URL, { dbName: DB_NAME });

  console.log(`Seeding "${DB_NAME}"`);

  for (const seeder of SEEDERS) {
    console.log(`\n[${seeder.name}]`);
    await seeder.run();
  }

  await mongoose.disconnect();
  console.log('\nSeed complete');
}

seed().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
