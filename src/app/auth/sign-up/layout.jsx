'use client';

import { Suspense } from 'react';

import { AuthCenteredLayout } from 'src/layouts/auth-centered';

import { SplashScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';

export default function Layout({ children }) {
  return (
    <Suspense fallback={<SplashScreen />}>
      <GuestGuard>
        <AuthCenteredLayout>{children}</AuthCenteredLayout>
      </GuestGuard>
    </Suspense>
  );
}
