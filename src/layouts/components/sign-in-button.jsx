'use client';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/config-global';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function SignInButton({ sx, ...other }) {
  const { authenticated } = useAuthContext();

  const href = authenticated ? CONFIG.auth.redirectPath : paths.auth.signIn;
  const label = authenticated ? 'Dashboard' : 'Sign in';

  return (
    <Button component={RouterLink} href={href} variant="outlined" sx={sx} {...other}>
      {label}
    </Button>
  );
}
