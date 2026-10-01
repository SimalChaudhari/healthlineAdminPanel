'use client';

import { z as zod } from 'zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axios, { endpoints } from 'src/utils/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { AI_FEATURE_OPTIONS, DEFAULT_AI_FEATURES_BY_PLAN } from 'src/config/ai-features';
import { lucideToIconify } from '../feature/feature-icon-picker';

// ----------------------------------------------------------------------

function aiOptionLabel(option) {
  const tint = option.color || 'text.secondary';
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${tint}22`,
          flexShrink: 0,
        }}
      >
        <Iconify icon={lucideToIconify(option.icon)} width={18} sx={{ color: tint }} />
      </Box>
      <Box component="span">{option.label}</Box>
    </Stack>
  );
}

function toAiCheckboxOptions(rows) {
  return (rows || []).map((row) => ({
    value: row.value,
    label: row.label,
    labelNode: aiOptionLabel(row),
  }));
}

// ----------------------------------------------------------------------

export const PlanFormSchema = zod.object({
  code: zod
    .string()
    .min(1, { message: 'Code is required!' })
    .regex(/^[A-Za-z0-9_-]+$/, { message: 'Use letters, numbers, _ or - only' }),
  name: zod.string().min(1, { message: 'Name is required!' }),
  tagline: zod.string().optional(),
  priceMonthly: zod.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(0, { message: 'Price cannot be negative' }),
  priceYearly: zod
    .union([zod.literal(''), zod.nan(), zod.null(), zod.coerce.number().min(0)])
    .optional()
    .transform((value) => {
      if (value === '' || value == null || Number.isNaN(value)) return '';
      return value;
    }),
  featuresText: zod.string().optional(),
  aiFeatures: zod.array(zod.string()).optional(),
  highlight: zod.boolean().optional(),
  status: zod.enum(['Active', 'Inactive']),
  sortOrder: zod.coerce.number().optional(),
});

function featuresToText(features) {
  if (!Array.isArray(features)) return '';
  return features.filter(Boolean).join('\n');
}

function textToFeatures(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function priceToInput(value) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const digits = String(value).replace(/[^\d.]/g, '');
  if (!digits) return '';
  const n = Number(digits);
  return Number.isFinite(n) ? n : '';
}

// ----------------------------------------------------------------------

export function HealthlinePlanForm({ currentPlan }) {
  const router = useRouter();
  const isEdit = !!currentPlan;
  const [aiOptions, setAiOptions] = useState(() => toAiCheckboxOptions(AI_FEATURE_OPTIONS));

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get(`${endpoints.features.list}?ai=1`);
        const rows = res.data?.features || [];
        if (active && rows.length) {
          setAiOptions(toAiCheckboxOptions(rows));
        }
      } catch {
        // keep static fallback
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const defaultValues = useMemo(
    () => ({
      code: currentPlan?.code || '',
      name: currentPlan?.name || '',
      tagline: currentPlan?.tagline || '',
      priceMonthly: priceToInput(currentPlan?.priceMonthly) === '' ? 0 : priceToInput(currentPlan?.priceMonthly),
      priceYearly: priceToInput(currentPlan?.priceYearly),
      featuresText: featuresToText(currentPlan?.features),
      aiFeatures:
        Array.isArray(currentPlan?.aiFeatures) && currentPlan.aiFeatures.length
          ? currentPlan.aiFeatures
          : DEFAULT_AI_FEATURES_BY_PLAN[currentPlan?.code] || [],
      highlight: Boolean(currentPlan?.highlight),
      status: currentPlan?.status || 'Active',
      sortOrder: currentPlan?.sortOrder ?? 0,
    }),
    [currentPlan]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(PlanFormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        code: data.code.trim(),
        name: data.name.trim(),
        tagline: data.tagline || '',
        priceMonthly: Number(data.priceMonthly) || 0,
        priceYearly:
          data.priceYearly === '' || data.priceYearly == null
            ? null
            : Number(data.priceYearly),
        features: textToFeatures(data.featuresText),
        aiFeatures: data.aiFeatures || [],
        highlight: Boolean(data.highlight),
        status: data.status,
        sortOrder: Number(data.sortOrder) || 0,
      };

      if (isEdit) {
        await axios.put(endpoints.plans.details(currentPlan.id), payload);
        toast.success('Plan updated');
      } else {
        await axios.post(endpoints.plans.list, payload);
        toast.success('Plan created');
      }

      reset();
      router.push(paths.dashboard.subscriptions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save plan');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Plans saved here appear on the Healthline app Subscription screen (Active plans only).
        </Typography>

        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
        >
          <Field.Text
            name="code"
            label="Plan code"
            helperText="Used on the user record (e.g. Free, Plus, Family)"
            disabled={isEdit}
          />
          <Field.Text name="name" label="Plan title" helperText="Shown as the card title in the app" />
          <Field.Text
            name="tagline"
            label="Subtitle"
            helperText="Short line under the title"
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
          <Field.Text
            name="priceMonthly"
            label="Monthly price (₹)"
            type="number"
            inputProps={{ min: 0, step: 1, inputMode: 'numeric' }}
            placeholder="199"
            helperText="Numbers only — shown as ₹…/mo in the app"
          />
          <Field.Text
            name="priceYearly"
            label="Yearly price (₹)"
            type="number"
            inputProps={{ min: 0, step: 1, inputMode: 'numeric' }}
            placeholder="1999"
            helperText="Numbers only — leave empty if no yearly option"
          />
          <Field.Select name="status" label="Status">
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Field.Select>
          <Field.Text name="sortOrder" label="Sort order" type="number" />
          <Field.Checkbox name="highlight" label="Mark as Popular" />
          <Field.MultiCheckbox
            name="aiFeatures"
            label="AI features unlocked on this plan"
            options={aiOptions}
            sx={{ gridColumn: { sm: '1 / -1' } }}
            helperText="From App Features (AI). Users on this plan can use only the checked tools."
          />
          <Field.Text
            name="featuresText"
            label="Marketing features"
            multiline
            rows={6}
            helperText="One feature per line — shown with checkmarks on the Subscription screen"
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.push(paths.dashboard.subscriptions)}
          >
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create plan'}
          </LoadingButton>
        </Stack>
      </Card>
    </Form>
  );
}
