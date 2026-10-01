'use client';

import { Suspense } from 'react';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { SplashScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

export default function Layout({ children }) {
  const content = <DashboardLayout>{children}</DashboardLayout>;

  if (CONFIG.auth.skip) {
    return content;
  }

  return (
    <Suspense fallback={<SplashScreen />}>
      <AuthGuard>{content}</AuthGuard>
    </Suspense>
  );
}
