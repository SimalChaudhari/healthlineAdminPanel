import { paramCase } from 'src/utils/change-case';

import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  docs: 'https://www.sr.io/',
  changelog: 'https://www.sr.io/',
  zoneStore: 'https://www.sr.io/',
  minimalStore: 'https://www.sr.io/',
  freeUI: 'https://www.sr.io/',
  figma: 'https://www.sr.io/',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: { details: `/product/${MOCK_ID}` },
  },
  post: {
    root: `/post`,
    details: (title) => `/post/${paramCase(title)}`,
    demo: { details: `/post/${paramCase(MOCK_TITLE)}` },
  },
  // AUTH
  auth: {
    signIn: `${ROOTS.AUTH}/sign-in`,
    signUp: `${ROOTS.AUTH}/sign-in`,
    forgotPassword: `${ROOTS.AUTH}/forgot-password`,
    amplify: {
      signIn: `${ROOTS.AUTH}/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/sign-in`,
      signUp: `${ROOTS.AUTH}/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  authDemo: {
    split: {
      signIn: `${ROOTS.AUTH_DEMO}/split/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/split/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/split/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/split/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/split/verify`,
    },
    centered: {
      signIn: `${ROOTS.AUTH_DEMO}/centered/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/centered/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/centered/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/centered/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/centered/verify`,
    },
  },
  // DASHBOARD — HealthLine admin
  dashboard: {
    root: ROOTS.DASHBOARD,
    users: `${ROOTS.DASHBOARD}/users`,
    usersNew: `${ROOTS.DASHBOARD}/users/new`,
    usersEdit: (id) => `${ROOTS.DASHBOARD}/users/${id}/edit`,
    subscriptions: `${ROOTS.DASHBOARD}/subscriptions`,
    features: `${ROOTS.DASHBOARD}/features`,
    payments: `${ROOTS.DASHBOARD}/payments`,
    ai: `${ROOTS.DASHBOARD}/ai`,
    foods: `${ROOTS.DASHBOARD}/foods`,
    foodsNew: `${ROOTS.DASHBOARD}/foods/new`,
    foodsDetails: (id) => `${ROOTS.DASHBOARD}/foods/${id}`,
    foodsEdit: (id) => `${ROOTS.DASHBOARD}/foods/${id}/edit`,
    recipes: `${ROOTS.DASHBOARD}/recipes`,
    recipesNew: `${ROOTS.DASHBOARD}/recipes/new`,
    recipesEdit: (id) => `${ROOTS.DASHBOARD}/recipes/${id}/edit`,
    workouts: `${ROOTS.DASHBOARD}/workouts`,
    tracks: `${ROOTS.DASHBOARD}/tracks`,
    content: `${ROOTS.DASHBOARD}/content`,
    languages: `${ROOTS.DASHBOARD}/languages`,
    notifications: `${ROOTS.DASHBOARD}/notifications`,
    reports: `${ROOTS.DASHBOARD}/health-reports`,
    support: `${ROOTS.DASHBOARD}/support`,
    security: `${ROOTS.DASHBOARD}/security`,
    settings: `${ROOTS.DASHBOARD}/app-settings`,
    audit: `${ROOTS.DASHBOARD}/audit-logs`,
    // Keep template paths so old demo pages do not crash if opened
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    general: {
      app: ROOTS.DASHBOARD,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
      course: `${ROOTS.DASHBOARD}/course`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/users`,
      new: `${ROOTS.DASHBOARD}/users/new`,
      list: `${ROOTS.DASHBOARD}/users`,
      cards: `${ROOTS.DASHBOARD}/users`,
      profile: `${ROOTS.DASHBOARD}/users`,
      account: `${ROOTS.DASHBOARD}/users`,
      edit: (id) => `${ROOTS.DASHBOARD}/users/${id}/edit`,
      demo: { edit: `${ROOTS.DASHBOARD}/users` },
    },
    product: {
      root: `${ROOTS.DASHBOARD}/foods`,
      new: `${ROOTS.DASHBOARD}/foods/new`,
      details: (id) => `${ROOTS.DASHBOARD}/foods/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/foods/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/foods`,
        edit: `${ROOTS.DASHBOARD}/foods`,
      },
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/payments`,
      new: `${ROOTS.DASHBOARD}/payments`,
      details: () => `${ROOTS.DASHBOARD}/payments`,
      edit: () => `${ROOTS.DASHBOARD}/payments`,
      demo: { details: `${ROOTS.DASHBOARD}/payments`, edit: `${ROOTS.DASHBOARD}/payments` },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/content`,
      new: `${ROOTS.DASHBOARD}/content`,
      details: () => `${ROOTS.DASHBOARD}/content`,
      edit: () => `${ROOTS.DASHBOARD}/content`,
      demo: { details: `${ROOTS.DASHBOARD}/content`, edit: `${ROOTS.DASHBOARD}/content` },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/payments`,
      details: () => `${ROOTS.DASHBOARD}/payments`,
      demo: { details: `${ROOTS.DASHBOARD}/payments` },
    },
    job: {
      root: `${ROOTS.DASHBOARD}/workouts`,
      new: `${ROOTS.DASHBOARD}/workouts`,
      details: () => `${ROOTS.DASHBOARD}/workouts`,
      edit: () => `${ROOTS.DASHBOARD}/workouts`,
      demo: { details: `${ROOTS.DASHBOARD}/workouts`, edit: `${ROOTS.DASHBOARD}/workouts` },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tracks`,
      new: `${ROOTS.DASHBOARD}/tracks`,
      details: () => `${ROOTS.DASHBOARD}/tracks`,
      edit: () => `${ROOTS.DASHBOARD}/tracks`,
      demo: { details: `${ROOTS.DASHBOARD}/tracks`, edit: `${ROOTS.DASHBOARD}/tracks` },
    },
  },
};
