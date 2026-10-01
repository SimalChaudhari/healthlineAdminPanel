import { CONFIG } from 'src/config-global';
import { deleteCookie } from 'src/utils/cookie';
import axios, { endpoints } from 'src/utils/axios';

import { setSession } from './utils';
import { DEMO_USERS } from './constant';

const encodeSegment = (obj) => {
  const json = JSON.stringify(obj);
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(json);
  }
  return Buffer.from(json).toString('base64');
};

const createStaticToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.email,
    email: user.email,
    name: user.email,
    exp: now + 60 * 60 * 24 * 3, // 3 days
  };
  return `${encodeSegment(header)}.${encodeSegment(payload)}.static-signature`;
};

/** **************************************
 * Sign in
 * Template: mock users when CONFIG.auth.useMock
 * Real app: set useMock false and use your API
 *************************************** */
export const signInWithPassword = async ({ email, password }) => {
  try {
    if (CONFIG.auth.useMock) {
      const demoUser = DEMO_USERS.find(
        (user) => user.email === email && user.password === password
      );

      if (!demoUser) {
        throw new Error('Please check your email and password');
      }

      await setSession(createStaticToken(demoUser));
      return;
    }

    const res = await axios.post(endpoints.auth.signIn, { email, password, adminOnly: true });
    const { accessToken, user } = res.data;

    if (!accessToken) {
      throw new Error('Please check your email and password');
    }

    if (user?.role && user.role !== 'admin') {
      throw new Error('This account cannot access the admin panel');
    }

    await setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error instanceof Error ? error : new Error(error?.message || 'Please check your email and password');
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ email, password, firstName, lastName }) => {
  try {
    if (CONFIG.auth.useMock) {
      await setSession(createStaticToken({ email }));
      return;
    }

    const res = await axios.post(endpoints.auth.signUp, {
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
    });

    const { accessToken, user } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    if (user?.role && user.role !== 'admin') {
      throw new Error('This account cannot access the admin panel');
    }

    await setSession(accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error instanceof Error ? error : new Error(error?.message || 'Unable to create account');
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    await setSession(null);
    deleteCookie('access-token');
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

/** **************************************
 * Sign in With Google
 *************************************** */
export const signInWithGoogleRedirect = async () => {
  try {
    const res = await axios.get(endpoints.auth.google.redirect);
    return res.data.url;
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};
