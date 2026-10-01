'use client';

import { useMemo } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';

import { startNavigationProgress } from 'src/components/progress-bar';

// ----------------------------------------------------------------------

export function useRouter() {
  const router = useNextRouter();

  return useMemo(
    () => ({
      back: () => {
        startNavigationProgress();
        router.back();
      },
      forward: () => {
        startNavigationProgress();
        router.forward();
      },
      refresh: () => router.refresh(),
      push: (href) => {
        startNavigationProgress(href);
        router.push(href);
      },
      replace: (href) => {
        startNavigationProgress(href);
        router.replace(href);
      },
    }),
    [router]
  );
}
