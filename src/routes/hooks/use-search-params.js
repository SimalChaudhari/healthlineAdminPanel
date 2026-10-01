'use client';

import { useMemo } from 'react';
import { useSearchParams as useNextSearchParams } from 'next/navigation';

// ----------------------------------------------------------------------

export function useSearchParams() {
  const searchParams = useNextSearchParams();

  return useMemo(() => searchParams, [searchParams]);
}
