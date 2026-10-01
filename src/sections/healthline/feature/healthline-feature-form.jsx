'use client';

import { z as zod } from 'zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormLabel from '@mui/material/FormLabel';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axios, { endpoints } from 'src/utils/axios';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { ColorPicker } from 'src/components/color-utils';

import { FeatureIconPicker, FEATURE_ICON_OPTIONS } from './feature-icon-picker';

// ----------------------------------------------------------------------

/** Hub palette (defaults + brand). */
export const FEATURE_COLOR_OPTIONS = [
  '#0070E0',
  '#0984E3',
  '#03A9F4',
  '#26C6DA',
  '#2ECC71',
  '#66BB6A',
  '#9CCC65',
  '#FFCA28',
  '#FF9800',
  '#FF7043',
  '#FF3B30',
  '#F06292',
  '#FD79A8',
  '#9B59B6',
  '#6C5CE7',
  '#7986CB',
];

export const FeatureFormSchema = zod.object({
  key: zod
    .string()
    .min(1, { message: 'Key is required!' })
    .regex(/^[A-Za-z0-9_-]+$/, { message: 'Use letters, numbers, _ or - only' }),
  label: zod.string().min(1, { message: 'Label is required!' }),
  description: zod.string().optional(),
  icon: zod.string().min(1, { message: 'Icon is required!' }),
  color: zod.string().min(1, { message: 'Color is required!' }),
  route: zod.string().optional(),
  routeParamsText: zod.string().optional(),
  aiKey: zod.string().optional(),
  showInHub: zod.boolean().optional(),
  status: zod.enum(['Active', 'Inactive']),
});

function paramsToText(value) {
  if (!value) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

function textToParams(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  return JSON.parse(raw);
}

// ----------------------------------------------------------------------

export function HealthlineFeatureForm({ currentFeature }) {
  const router = useRouter();
  const isEdit = !!currentFeature;

  const defaultValues = useMemo(
    () => ({
      key: currentFeature?.key || '',
      label: currentFeature?.label || '',
      description: currentFeature?.description || '',
      icon: currentFeature?.icon || 'Flame',
      color: currentFeature?.color || '#0070E0',
      route: currentFeature?.route || '',
      routeParamsText: paramsToText(currentFeature?.routeParams),
      aiKey: currentFeature?.aiKey || '',
      showInHub: currentFeature?.showInHub !== false,
      status: currentFeature?.status || 'Active',
    }),
    [currentFeature]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(FeatureFormSchema),
    defaultValues,
  });

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const colorOptions = useMemo(() => {
    const current = currentFeature?.color;
    if (current && !FEATURE_COLOR_OPTIONS.includes(current)) {
      return [current, ...FEATURE_COLOR_OPTIONS];
    }
    return FEATURE_COLOR_OPTIONS;
  }, [currentFeature?.color]);

  const iconOptions = useMemo(() => {
    const current = currentFeature?.icon;
    if (current && !FEATURE_ICON_OPTIONS.includes(current)) {
      return [current, ...FEATURE_ICON_OPTIONS];
    }
    return FEATURE_ICON_OPTIONS;
  }, [currentFeature?.icon]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      let routeParams = null;
      try {
        routeParams = textToParams(data.routeParamsText);
      } catch {
        toast.error('Route params must be valid JSON (or empty)');
        return;
      }

      const payload = {
        key: data.key.trim(),
        label: data.label.trim(),
        description: data.description || '',
        icon: data.icon || '',
        color: data.color || '#0070E0',
        route: data.route || '',
        routeParams,
        aiKey: data.aiKey || '',
        showInHub: Boolean(data.showInHub),
        status: data.status,
      };

      if (isEdit) {
        await axios.put(endpoints.features.details(currentFeature.id), payload);
        toast.success('Feature updated');
      } else {
        await axios.post(endpoints.features.list, payload);
        toast.success('Feature created');
      }

      reset();
      router.push(paths.dashboard.features);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save feature');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          These power the APK All features hub. Set an AI key to gate the feature by subscription plan.
        </Typography>

        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
        >
          <Field.Text
            name="key"
            label="Feature key"
            helperText="Stable id used in the app (e.g. scan, coach)"
            disabled={isEdit}
          />
          <Field.Text name="label" label="Label" helperText="Shown on the All features grid" />
          <Field.Text
            name="description"
            label="Description"
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
          <Stack spacing={1.5} sx={{ gridColumn: { sm: '1 / -1' } }}>
            <FormLabel sx={{ typography: 'body2' }}>Icon</FormLabel>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <FeatureIconPicker
                  selected={field.value}
                  onSelectIcon={(icon) => field.onChange(icon)}
                  icons={iconOptions}
                />
              )}
            />
          </Stack>
          <Stack spacing={1.5} sx={{ gridColumn: { sm: '1 / -1' } }}>
            <FormLabel sx={{ typography: 'body2' }}>Color</FormLabel>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <ColorPicker
                  selected={field.value}
                  onSelectColor={(color) => field.onChange(color)}
                  colors={colorOptions}
                />
              )}
            />
          </Stack>
          <Field.Text name="route" label="App route" helperText="e.g. ScanFood, Coach, Diary" />

          <Field.Text
            name="aiKey"
            label="AI key (optional)"
            helperText="If set, unlock via plan AI checkboxes (e.g. mealScanner)"
          />
          <Field.Select name="status" label="Status">
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Field.Select>
          <Field.Checkbox name="showInHub" label="Show in All features hub" />
          <Field.Text
            name="routeParamsText"
            label="Route params (JSON)"
            multiline
            rows={3}
            helperText='Optional JSON, e.g. { "meal": "lunch" }'
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.push(paths.dashboard.features)}
          >
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create feature'}
          </LoadingButton>
        </Stack>
      </Card>
    </Form>
  );
}
