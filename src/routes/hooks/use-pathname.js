'use client';

import { useMemo } from 'react';
import { usePathname as useNextPathname } from 'next/navigation';

// ----------------------------------------------------------------------

export function usePathname() {
  const pathname = useNextPathname();

  return useMemo(() => pathname, [pathname]);
}
