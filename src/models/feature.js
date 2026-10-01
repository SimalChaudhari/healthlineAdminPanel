import mongoose from 'mongoose';

/**
 * App feature catalog (All features hub + AI tools).
 * `aiKey` links to plan.aiFeatures for subscription gating.
 */
const featureSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    icon: { type: String, default: '', trim: true },
    color: { type: String, default: '#0070E0', trim: true },
    route: { type: String, default: '', trim: true },
    routeParams: { type: mongoose.Schema.Types.Mixed, default: null },
    /** If set, this feature is gated by plan.aiFeatures. */
    aiKey: { type: String, default: '', trim: true },
    showInHub: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

featureSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: String(this._id),
    key: this.key,
    label: this.label,
    description: this.description || '',
    icon: this.icon || '',
    color: this.color || '#0070E0',
    route: this.route || '',
    routeParams: this.routeParams || null,
    aiKey: this.aiKey || '',
    isAi: Boolean(this.aiKey),
    showInHub: this.showInHub !== false,
    status: this.status || 'Active',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/** Shape for Healthline APK All features hub / catalog. */
featureSchema.methods.toAppJSON = function toAppJSON() {
  return {
    id: this.key,
    label: this.label,
    description: this.description || '',
    icon: this.icon || '',
    color: this.color || '#0070E0',
    route: this.route || '',
    params: this.routeParams || {},
    aiKey: this.aiKey || null,
    showInHub: this.showInHub !== false,
    status: this.status || 'Active',
  };
};

export const Feature = mongoose.models.Feature || mongoose.model('Feature', featureSchema);

export const DEFAULT_FEATURES = [
  {
    key: 'food',
    label: 'Food Tracking',
    description: 'Search and log meals',
    icon: 'UtensilsCrossed',
    color: '#FF9800',
    route: 'AddFood',
    routeParams: { meal: 'breakfast' },
    aiKey: '',
    showInHub: true,
  },
  {
    key: 'scan',
    label: 'Meal Scanner',
    description: 'AI photo meal diagnosis',
    icon: 'ScanLine',
    color: '#03A9F4',
    route: 'ScanFood',
    routeParams: { meal: 'lunch' },
    aiKey: 'mealScanner',
    showInHub: true,
  },
  {
    key: 'cal',
    label: 'Calorie Counter',
    description: 'Daily calorie diary',
    icon: 'Flame',
    color: '#F06292',
    route: 'Diary',
    routeParams: null,
    aiKey: '',
    showInHub: true,
  },
  {
    key: 'macro',
    label: 'Macro Tracking',
    description: 'Protein, carbs, fat progress',
    icon: 'PieChart',
    color: '#9B59B6',
    route: 'Progress',
    routeParams: null,
    aiKey: '',
    showInHub: true,
  },
  {
    key: 'water',
    label: 'Water Tracker',
    description: 'Log daily water intake',
    icon: 'Droplets',
    color: '#26C6DA',
    route: 'Dashboard',
    routeParams: null,
    aiKey: '',
    showInHub: true,
  },
  {
    key: 'exercise',
    label: 'Exercise Log',
    description: 'Log workouts and burn',
    icon: 'Dumbbell',
    color: '#66BB6A',
    route: 'LogExercise',
    routeParams: {},
    aiKey: '',
    showInHub: true,
  },
  {
    key: 'weight',
    label: 'Weight Tracker',
    description: 'Track body weight',
    icon: 'Scale',
    color: '#FFCA28',
    route: 'LogWeight',
    routeParams: null,
    aiKey: '',
    showInHub: true,
  },
  {
    key: 'charts',
    label: 'Progress Charts',
    description: 'Trends and insights',
    icon: 'ChartLine',
    color: '#7986CB',
    route: 'Progress',
    routeParams: null,
    aiKey: '',
    showInHub: true,
  },
  {
    key: 'recipes',
    label: 'Healthy Recipes',
    description: 'Discover recipes',
    icon: 'Salad',
    color: '#9CCC65',
    route: 'Discover',
    routeParams: null,
    aiKey: '',
    showInHub: true,
  },
  {
    key: 'planner',
    label: 'Meal Planner',
    description: 'Plan meals ahead',
    icon: 'CalendarDays',
    color: '#FF7043',
    route: 'MealPlan',
    routeParams: null,
    aiKey: '',
    showInHub: true,
  },
  {
    key: 'coach',
    label: 'AI Nutrition Coach',
    description: 'Chat coaching assist',
    icon: 'Sparkles',
    color: '#0984E3',
    route: 'Coach',
    routeParams: null,
    aiKey: 'aiCoach',
    showInHub: true,
  },
  {
    key: 'reminders',
    label: 'Reminders',
    description: 'Meal and habit nudges',
    icon: 'Bell',
    color: '#FD79A8',
    route: 'Reminders',
    routeParams: null,
    aiKey: '',
    showInHub: true,
  },
  {
    key: 'barcode',
    label: 'Barcode Scan',
    description: 'Scan packaged foods',
    icon: 'Barcode',
    color: '#FFCA28',
    route: 'BarcodeScan',
    routeParams: { meal: 'snacks' },
    aiKey: 'barcodeScan',
    showInHub: true,
  },
  {
    key: 'voiceLog',
    label: 'Voice Logging',
    description: 'Log meals by voice / text AI',
    icon: 'Mic',
    color: '#6C5CE7',
    route: 'VoiceLog',
    routeParams: { meal: 'snacks' },
    aiKey: 'voiceLog',
    showInHub: false,
  },
  {
    key: 'workoutAi',
    label: 'Workout AI',
    description: 'AI workout suggestions',
    icon: 'Dumbbell',
    color: '#2ECC71',
    route: 'Programs',
    routeParams: null,
    aiKey: 'workoutAi',
    showInHub: false,
  },
  {
    key: 'medicalAi',
    label: 'Medical AI',
    description: 'Medical assist — keep OFF until ready',
    icon: 'HeartPulse',
    color: '#FF3B30',
    route: '',
    routeParams: null,
    aiKey: 'medicalAi',
    showInHub: false,
    status: 'Inactive',
  },
];

export async function ensureDefaultFeatures() {
  // Drop legacy `sortOrder` from existing docs (native driver: schema no longer has the path).
  await Feature.collection.updateMany(
    { sortOrder: { $exists: true } },
    { $unset: { sortOrder: '' } }
  );

  const count = await Feature.countDocuments();
  if (count > 0) return;

  await Feature.insertMany(
    DEFAULT_FEATURES.map((item) => ({
      ...item,
      status: item.status || 'Active',
    }))
  );
}
