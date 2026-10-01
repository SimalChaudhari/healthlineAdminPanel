'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import { ComponentNav } from './component-nav';

// ----------------------------------------------------------------------

export const componentPaddingX = { xs: 2, md: 5, xl: 10 };

// ----------------------------------------------------------------------

export function ComponentLayout({ children, slotRight }) {
  return (
    <Box
      sx={{
        width: 1,
        mt: { xs: 5, md: 10 },
        mb: 15,
        px: componentPaddingX,
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'flex-start' }} spacing={3}>
        <ComponentNav />

        <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
          <Container maxWidth="md" disableGutters sx={{ p: 0, width: 1, mx: 'auto' }}>
            {children}
          </Container>
        </Box>

        {slotRight}
      </Stack>
    </Box>
  );
}
