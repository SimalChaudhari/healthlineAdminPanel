import {
  HL_SUBSCRIPTIONS,
  HL_PAYMENTS,
  HL_AI_FEATURES,
  HL_AI_SAFETY,
  HL_FOODS,
  HL_RECIPES,
  HL_WORKOUTS,
  HL_TRACKS,
  HL_CONTENT,
  HL_LANGUAGES,
  HL_NOTIFICATIONS,
  HL_REPORTS,
  HL_SUPPORT,
  HL_SECURITY,
  HL_SETTINGS,
  HL_AUDIT_LOGS,
} from 'src/_mock/_healthline';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

/** In-memory CRUD store so create/edit pages stay in sync with list tables (session). */
const store = {};

export function getEntityRows(entityKey, seed = []) {
  if (!store[entityKey]) {
    store[entityKey] = seed.map((row) => ({ ...row }));
  }
  return store[entityKey];
}

export function setEntityRows(entityKey, rows) {
  store[entityKey] = rows.map((row) => ({ ...row }));
  return store[entityKey];
}

export function getEntityRow(entityKey, seed, id) {
  return getEntityRows(entityKey, seed).find((row) => String(row.id) === String(id)) || null;
}

export function upsertEntityRow(entityKey, seed, row) {
  const rows = getEntityRows(entityKey, seed);
  const idx = rows.findIndex((item) => String(item.id) === String(row.id));
  if (idx >= 0) {
    rows[idx] = { ...rows[idx], ...row };
  } else {
    rows.unshift(row);
  }
  return setEntityRows(entityKey, rows);
}

export function deleteEntityRow(entityKey, seed, id) {
  const rows = getEntityRows(entityKey, seed).filter((row) => String(row.id) !== String(id));
  return setEntityRows(entityKey, rows);
}

// ----------------------------------------------------------------------

export const HEALTHLINE_ENTITIES = {
  subscriptions: {
    key: 'subscriptions',
    title: 'Subscriptions',
    singular: 'plan',
    description: 'Free, Plus, and Family plan catalog (test prices).',
    createLabel: 'Add plan',
    searchPlaceholder: 'Search plans...',
    filterKeys: ['billing', 'status'],
    listPath: paths.dashboard.subscriptions,
    segment: 'subscriptions',
    seed: HL_SUBSCRIPTIONS,
    columns: [
      { key: 'plan', label: 'Plan' },
      { key: 'price', label: 'Price' },
      { key: 'billing', label: 'Billing' },
      { key: 'active', label: 'Active users' },
      { key: 'status', label: 'Status' },
    ],
  },
  payments: {
    key: 'payments',
    title: 'Payments',
    singular: 'payment',
    description: 'Payment history, refunds, and failed charges.',
    createLabel: 'Add payment',
    searchPlaceholder: 'Search payments...',
    filterKeys: ['method', 'status'],
    listPath: paths.dashboard.payments,
    segment: 'payments',
    seed: HL_PAYMENTS,
    columns: [
      { key: 'user', label: 'User' },
      { key: 'amount', label: 'Amount' },
      { key: 'method', label: 'Method' },
      { key: 'plan', label: 'Plan' },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date', type: 'date' },
    ],
  },
  foods: {
    key: 'foods',
    title: 'Food Database',
    singular: 'food',
    description: 'Approve and edit foods the APK can search and log.',
    createLabel: 'Add food',
    searchPlaceholder: 'Search foods...',
    filterKeys: ['cuisine', 'category', 'status'],
    listPath: paths.dashboard.foods,
    segment: 'foods',
    seed: HL_FOODS,
    columns: [
      { key: 'name', label: 'Food' },
      { key: 'calories', label: 'Calories' },
      { key: 'protein', label: 'Protein' },
      { key: 'carbs', label: 'Carbs' },
      { key: 'fat', label: 'Fat' },
      { key: 'serving', label: 'Serving' },
      { key: 'cuisine', label: 'Cuisine' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' },
    ],
  },
  recipes: {
    key: 'recipes',
    title: 'Recipes',
    singular: 'recipe',
    description: 'Create, tag, and publish recipes for Discover.',
    createLabel: 'Add recipe',
    searchPlaceholder: 'Search recipes...',
    filterKeys: ['cuisine', 'meal', 'status'],
    listPath: paths.dashboard.recipes,
    segment: 'recipes',
    seed: HL_RECIPES,
    columns: [
      { key: 'title', label: 'Recipe' },
      { key: 'cuisine', label: 'Cuisine' },
      { key: 'meal', label: 'Meal' },
      { key: 'tags', label: 'Tags' },
      { key: 'status', label: 'Status' },
    ],
  },
  workouts: {
    key: 'workouts',
    title: 'Workout Programs',
    singular: 'program',
    description: 'Home and gym programs shown in the APK.',
    createLabel: 'Add program',
    searchPlaceholder: 'Search programs...',
    filterKeys: ['level', 'place', 'focus', 'status'],
    listPath: paths.dashboard.workouts,
    segment: 'workouts',
    seed: HL_WORKOUTS,
    columns: [
      { key: 'title', label: 'Program' },
      { key: 'level', label: 'Level' },
      { key: 'place', label: 'Place' },
      { key: 'focus', label: 'Focus' },
      { key: 'status', label: 'Status' },
    ],
  },
  tracks: {
    key: 'tracks',
    title: 'Health Tracks',
    singular: 'track',
    description: 'Habit tracks and milestones for user journeys.',
    createLabel: 'Add track',
    searchPlaceholder: 'Search tracks...',
    filterKeys: ['status'],
    listPath: paths.dashboard.tracks,
    segment: 'tracks',
    seed: HL_TRACKS,
    columns: [
      { key: 'name', label: 'Track' },
      { key: 'habits', label: 'Habits' },
      { key: 'milestones', label: 'Milestones' },
      { key: 'status', label: 'Status' },
    ],
  },
  content: {
    key: 'content',
    title: 'Content',
    singular: 'content',
    description: 'Articles, guides, FAQs, and videos.',
    createLabel: 'Add content',
    searchPlaceholder: 'Search content...',
    filterKeys: ['type', 'lang', 'status'],
    listPath: paths.dashboard.content,
    segment: 'content',
    seed: HL_CONTENT,
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'lang', label: 'Language' },
      { key: 'status', label: 'Status' },
    ],
  },
  languages: {
    key: 'languages',
    title: 'Languages',
    singular: 'language',
    description: 'App language coverage and rollout status.',
    createLabel: 'Add language',
    searchPlaceholder: 'Search languages...',
    filterKeys: ['status'],
    listPath: paths.dashboard.languages,
    segment: 'languages',
    seed: HL_LANGUAGES,
    columns: [
      { key: 'name', label: 'Language' },
      { key: 'code', label: 'Code' },
      { key: 'status', label: 'Status' },
      { key: 'coverage', label: 'Coverage' },
    ],
  },
  notifications: {
    key: 'notifications',
    title: 'Notifications',
    singular: 'notification',
    description: 'Push, email, and in-app campaigns.',
    createLabel: 'Add notification',
    searchPlaceholder: 'Search notifications...',
    filterKeys: ['channel', 'status'],
    listPath: paths.dashboard.notifications,
    segment: 'notifications',
    seed: HL_NOTIFICATIONS,
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'channel', label: 'Channel' },
      { key: 'audience', label: 'Audience' },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date', type: 'date' },
    ],
  },
  reports: {
    key: 'reports',
    title: 'Health Reports',
    singular: 'report',
    description: 'Uploaded lab reports and review status.',
    createLabel: 'Add report',
    searchPlaceholder: 'Search reports...',
    filterKeys: ['type', 'status', 'review'],
    listPath: paths.dashboard.reports,
    segment: 'health-reports',
    seed: HL_REPORTS,
    columns: [
      { key: 'user', label: 'User' },
      { key: 'type', label: 'Type' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status' },
      { key: 'review', label: 'Review' },
    ],
  },
  support: {
    key: 'support',
    title: 'Support',
    singular: 'ticket',
    description: 'User tickets and assignment.',
    createLabel: 'Add ticket',
    searchPlaceholder: 'Search tickets...',
    filterKeys: ['priority', 'status'],
    listPath: paths.dashboard.support,
    segment: 'support',
    seed: HL_SUPPORT,
    columns: [
      { key: 'user', label: 'User' },
      { key: 'issue', label: 'Issue' },
      { key: 'priority', label: 'Priority' },
      { key: 'assigned', label: 'Assigned' },
      { key: 'status', label: 'Status' },
    ],
  },
  security: {
    key: 'security',
    title: 'Security',
    singular: 'role',
    description: 'Admin roles and access scopes.',
    createLabel: 'Add role',
    searchPlaceholder: 'Search roles...',
    filterKeys: ['access'],
    listPath: paths.dashboard.security,
    segment: 'security',
    seed: HL_SECURITY,
    columns: [
      { key: 'role', label: 'Role' },
      { key: 'users', label: 'Users' },
      { key: 'access', label: 'Access' },
      { key: 'lastChange', label: 'Last change' },
    ],
  },
  settings: {
    key: 'settings',
    title: 'App Settings',
    singular: 'setting',
    description: 'Global app configuration keys.',
    createLabel: 'Add setting',
    searchPlaceholder: 'Search settings...',
    filterKeys: ['group'],
    listPath: paths.dashboard.settings,
    segment: 'app-settings',
    seed: HL_SETTINGS,
    columns: [
      { key: 'group', label: 'Group' },
      { key: 'key', label: 'Key' },
      { key: 'value', label: 'Value' },
    ],
  },
  audit: {
    key: 'audit',
    title: 'Audit Logs',
    singular: 'log',
    description: 'Admin actions for compliance review.',
    createLabel: 'Add log',
    searchPlaceholder: 'Search audit logs...',
    filterKeys: ['action'],
    listPath: paths.dashboard.audit,
    segment: 'audit-logs',
    seed: HL_AUDIT_LOGS,
    columns: [
      { key: 'actor', label: 'Actor' },
      { key: 'action', label: 'Action' },
      { key: 'target', label: 'Target' },
      { key: 'time', label: 'Time' },
    ],
  },
  'ai-features': {
    key: 'ai-features',
    title: 'AI Features',
    singular: 'feature',
    description: 'Feature flags and usage.',
    createLabel: 'Add feature',
    searchPlaceholder: 'Search features...',
    filterKeys: ['status'],
    listPath: paths.dashboard.ai,
    segment: 'ai/features',
    seed: HL_AI_FEATURES,
    columns: [
      { key: 'feature', label: 'Feature' },
      { key: 'status', label: 'Status' },
      { key: 'requests', label: 'Requests' },
      { key: 'cost', label: 'Est. cost' },
    ],
  },
  'ai-safety': {
    key: 'ai-safety',
    title: 'AI Safety',
    singular: 'rule',
    description: 'Assist only — do not diagnose.',
    createLabel: 'Add rule',
    searchPlaceholder: 'Search safety rules...',
    filterKeys: ['action'],
    listPath: paths.dashboard.ai,
    segment: 'ai/safety',
    seed: HL_AI_SAFETY,
    columns: [
      { key: 'rule', label: 'Rule' },
      { key: 'action', label: 'Action' },
      { key: 'enabled', label: 'Enabled' },
    ],
  },
};

export function getHealthlineEntity(entityKey) {
  return HEALTHLINE_ENTITIES[entityKey] || null;
}

export function entityCreatePath(entity) {
  return `${ROOT_DASHBOARD_SEGMENT(entity)}/new`;
}

export function entityEditPath(entity, id) {
  return `${ROOT_DASHBOARD_SEGMENT(entity)}/${id}/edit`;
}

function ROOT_DASHBOARD_SEGMENT(entity) {
  return `/dashboard/${entity.segment}`;
}
