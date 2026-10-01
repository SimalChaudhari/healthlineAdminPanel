import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  // Empty = same origin so /api/auth hits this Next.js backend
  baseURL: CONFIG.site.serverUrl || '',
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response && error.response.data;
    const message =
      (data && data.message) || (typeof data === 'string' ? data : '') || error.message || 'Something went wrong!';
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    // Absolute URLs ignore baseURL; relative ones use it
    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/sign-in',
    signUp: '/api/auth/sign-up',
    google: {
      redirect: '/api/auth/google/redirect',
    },
  },
  dashboard: {
    stats: '/api/dashboard/stats',
  },
  users: {
    list: '/api/users',
    details: (id) => `/api/users/${id}`,
  },
  upload: {
    image: '/api/upload/image',
  },
  notifications: {
    list: '/api/notifications',
    details: (id) => `/api/notifications/${id}`,
    send: (id) => `/api/notifications/${id}/send`,
  },
  reminders: {
    list: '/api/reminders',
    details: (key) => `/api/reminders/${key}`,
  },
  plans: {
    list: '/api/plans',
    details: (id) => `/api/plans/${id}`,
  },
  features: {
    list: '/api/features',
    details: (id) => `/api/features/${id}`,
  },
  foods: {
    list: '/api/foods',
    details: (id) => `/api/foods/${id}`,
  },
  recipes: {
    list: '/api/recipes',
    details: (id) => `/api/recipes/${id}`,
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
};
