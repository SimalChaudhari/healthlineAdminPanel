import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  passwordRules,
  passwordStrength,
  passwordStrengthColor,
  passwordStrengthLabel,
} from 'src/utils/password-rules';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/** Strength bar + rule checklist — same look and rules as the APK register screen. */
export function PasswordStrengthMeter({ value }) {
  const hasValue = String(value || '').length > 0;
  const score = passwordStrength(value);
  const color = passwordStrengthColor(score);
  const label = passwordStrengthLabel(score);
  const rules = passwordRules(value);

  return (
    <Box sx={{ mt: 1.5, px: 0.5 }}>
      {hasValue && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
          <Stack direction="row" spacing={0.5} sx={{ flex: 1 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: i < score ? color : 'action.hover',
                  transition: (theme) => theme.transitions.create('background-color'),
                }}
              />
            ))}
          </Stack>
          <Typography variant="caption" sx={{ color, fontWeight: 600, minWidth: 72, textAlign: 'right' }}>
            {label}
          </Typography>
        </Stack>
      )}

      <Stack spacing={0.75}>
        {rules.map((rule) => {
          let tone = 'text.disabled';
          if (hasValue) tone = rule.ok ? 'success.main' : 'error.main';

          return (
            <Stack key={rule.id} direction="row" alignItems="center" spacing={1}>
              <Iconify
                width={16}
                icon={rule.ok && hasValue ? 'eva:checkmark-circle-2-fill' : 'eva:close-circle-fill'}
                sx={{ color: tone, flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ color: tone, fontWeight: 500 }}>
                {rule.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}
