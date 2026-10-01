/** AI feature keys unlocked per subscription plan (Admin ↔ APK). */

export const AI_FEATURE_OPTIONS = [
  { value: 'mealScanner', label: 'Meal Scanner', icon: 'ScanLine', color: '#03A9F4' },
  { value: 'aiCoach', label: 'AI Nutrition Coach', icon: 'Sparkles', color: '#0984E3' },
  { value: 'voiceLog', label: 'Voice Logging', icon: 'Mic', color: '#6C5CE7' },
  { value: 'barcodeScan', label: 'Barcode Scan', icon: 'Barcode', color: '#FFCA28' },
  { value: 'workoutAi', label: 'Workout AI', icon: 'Dumbbell', color: '#2ECC71' },
  { value: 'medicalAi', label: 'Medical AI', icon: 'HeartPulse', color: '#FF3B30' },
];

export const AI_FEATURE_IDS = AI_FEATURE_OPTIONS.map((item) => item.value);

export const DEFAULT_AI_FEATURES_BY_PLAN = {
  Free: ['barcodeScan'],
  Plus: ['mealScanner', 'aiCoach', 'voiceLog', 'barcodeScan'],
  Family: ['mealScanner', 'aiCoach', 'voiceLog', 'barcodeScan', 'workoutAi'],
};

export function normalizeAiFeatures(value) {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .map((item) => String(item || '').trim())
        .filter((id) => /^[A-Za-z0-9_-]+$/.test(id))
    ),
  ];
}
