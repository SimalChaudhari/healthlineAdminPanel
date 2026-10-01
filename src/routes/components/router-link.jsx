'use client';

import { forwardRef } from 'react';
import Link from 'next/link';

export const RouterLink = forwardRef(({ href, ...other }, ref) => (
  <Link ref={ref} href={href} {...other} />
));
