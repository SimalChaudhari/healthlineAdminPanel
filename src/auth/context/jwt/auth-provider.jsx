'use client';

import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import { CONFIG } from 'src/config-global';
import axios, { endpoints } from 'src/utils/axios';
import { getCookie, deleteCookie } from 'src/utils/cookie';

import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { MOCK_USER } from 'src/auth/hooks/use-mocked-user';
import { setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    loading: true,
  });

  const clearSession = useCallback(async () => {
    await setSession(null);
    deleteCookie('access-token');
    sessionStorage.removeItem(STORAGE_KEY);
    setState({ user: null, loading: false });
  }, [setState]);

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken =
        localStorage.getItem(STORAGE_KEY) ||
        sessionStorage.getItem(STORAGE_KEY) ||
        getCookie('access-token');

      if (!accessToken || !isValidToken(accessToken)) {
        await clearSession();
        return;
      }

      await setSession(accessToken);
      sessionStorage.removeItem(STORAGE_KEY);

      // Template mock auth — no real API required
      if (CONFIG.auth.useMock) {
        setState({ user: { ...MOCK_USER, accessToken }, loading: false });
        return;
      }

      const res = await axios.get(endpoints.auth.me);
      const { user } = res.data;

      if (!user || user.role !== 'admin') {
        await clearSession();
        return;
      }

      setState({
        user: {
          ...user,
          accessToken,
          role: user.role || 'user',
        },
        loading: false,
      });
    } catch (error) {
      console.error(error);
      await clearSession();
    }
  }, [clearSession, setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            role: state.user?.role || (CONFIG.auth.useMock ? 'admin' : 'user'),
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
