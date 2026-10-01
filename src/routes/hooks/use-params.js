'use client';

import { useMemo } from 'react';
import { useParams as useNextParams } from 'next/navigation';

// ----------------------------------------------------------------------

export function useParams() {
  const params = useNextParams();

  return useMemo(() => params ?? {}, [params]);
}
