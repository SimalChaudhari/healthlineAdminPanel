'use client';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  dashboard: icon('ic-dashboard'),
  user: icon('ic-user'),
  banking: icon('ic-banking'),
  invoice: icon('ic-invoice'),
  analytics: icon('ic-analytics'),
  product: icon('ic-product'),
  blog: icon('ic-blog'),
  course: icon('ic-course'),
  tour: icon('ic-tour'),
  file: icon('ic-file'),
  label: icon('ic-label'),
  mail: icon('ic-mail'),
  folder: icon('ic-folder'),
  chat: icon('ic-chat'),
  lock: icon('ic-lock'),
  parameter: icon('ic-parameter'),
  order: icon('ic-order'),
};

// ----------------------------------------------------------------------

export const navData = [
  {
    subheader: 'HealthLine',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: 'Users', path: paths.dashboard.users, icon: ICONS.user },
      { title: 'Subscriptions', path: paths.dashboard.subscriptions, icon: ICONS.banking },
      { title: 'App Features', path: paths.dashboard.features, icon: ICONS.parameter },
      { title: 'Payments', path: paths.dashboard.payments, icon: ICONS.invoice },
      { title: 'AI', path: paths.dashboard.ai, icon: ICONS.analytics },
    ],
  },
  {
    subheader: 'Content',
    items: [
      { title: 'Food Database', path: paths.dashboard.foods, icon: ICONS.product },
      { title: 'Recipes', path: paths.dashboard.recipes, icon: ICONS.blog },
      { title: 'Workout Programs', path: paths.dashboard.workouts, icon: ICONS.course },
      { title: 'Health Tracks', path: paths.dashboard.tracks, icon: ICONS.tour },
      { title: 'Content', path: paths.dashboard.content, icon: ICONS.file },
      { title: 'Languages', path: paths.dashboard.languages, icon: ICONS.label },
    ],
  },
  {
    subheader: 'Operations',
    items: [
      { title: 'Notifications', path: paths.dashboard.notifications, icon: ICONS.mail },
      { title: 'Reports', path: paths.dashboard.reports, icon: ICONS.folder },
      { title: 'Support', path: paths.dashboard.support, icon: ICONS.chat },
      { title: 'Security', path: paths.dashboard.security, icon: ICONS.lock },
      { title: 'Settings', path: paths.dashboard.settings, icon: ICONS.parameter },
      { title: 'Audit Logs', path: paths.dashboard.audit, icon: ICONS.order },
    ],
  },
];
