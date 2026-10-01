'use client';

import { forwardRef, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/** Lucide PascalCase → Iconify `lucide:*` id */
export function lucideToIconify(name) {
  if (!name) return 'lucide:circle';
  const kebab = String(name)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
  return `lucide:${kebab}`;
}

/** Icons available for App Features (stored as Lucide component names). */
export const FEATURE_ICON_OPTIONS = [
  'UtensilsCrossed',
  'ScanLine',
  'Flame',
  'PieChart',
  'Droplets',
  'Dumbbell',
  'Scale',
  'ChartLine',
  'Salad',
  'CalendarDays',
  'Sparkles',
  'Bell',
  'Barcode',
  'Mic',
  'HeartPulse',
  'Apple',
  'Beef',
  'Coffee',
  'Cookie',
  'Activity',
  'Footprints',
  'Timer',
  'Target',
  'Trophy',
  'Moon',
  'Sun',
  'Camera',
  'MessageCircle',
  'BookOpen',
  'ShoppingCart',
];

// ----------------------------------------------------------------------

export const FeatureIconPicker = forwardRef(
  ({ icons = FEATURE_ICON_OPTIONS, selected, onSelectIcon, sx, ...other }, ref) => {
    const handleSelect = useCallback(
      (name) => {
        if (name !== selected) onSelectIcon?.(name);
      },
      [onSelectIcon, selected]
    );

    return (
      <Box ref={ref} sx={{ ...sx }} {...other}>
        <Box
          component="ul"
          sx={{
            m: 0,
            p: 0,
            gap: 1,
            display: 'flex',
            flexWrap: 'wrap',
            listStyle: 'none',
          }}
        >
          {icons.map((name) => {
            const hasSelected = selected === name;

            return (
              <Box component="li" key={name}>
                <Tooltip title={name} arrow placement="top">
                  <ButtonBase
                    aria-label={name}
                    onClick={() => handleSelect(name)}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      border: (theme) =>
                        `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
                      bgcolor: (theme) =>
                        hasSelected
                          ? varAlpha(theme.vars.palette.primary.mainChannel, 0.12)
                          : 'transparent',
                      ...(hasSelected && {
                        borderColor: 'primary.main',
                        boxShadow: (theme) =>
                          `0 0 0 1px ${theme.vars.palette.primary.main}`,
                      }),
                    }}
                  >
                    <Iconify icon={lucideToIconify(name)} width={22} />
                  </ButtonBase>
                </Tooltip>
              </Box>
            );
          })}
        </Box>

        {selected ? (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
            <Iconify icon={lucideToIconify(selected)} width={18} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {selected}
            </Typography>
          </Stack>
        ) : null}
      </Box>
    );
  }
);
