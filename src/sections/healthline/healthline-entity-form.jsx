'use client';

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';

import {
  getEntityRow,
  getHealthlineEntity,
  upsertEntityRow,
} from './healthline-entities';

// ----------------------------------------------------------------------

const SELECT_KEYS = new Set(['status', 'enabled', 'priority', 'review', 'action', 'billing', 'method', 'level', 'place', 'focus', 'type', 'lang', 'channel', 'cuisine', 'meal', 'category', 'group']);

const DATE_KEYS = new Set(['date', 'joined', 'lastChange', 'createdAt', 'updatedAt', 'sentAt', 'scheduledAt']);

function isDateColumn(col) {
  if (col?.type === 'date') return true;
  return DATE_KEYS.has(col?.key);
}

function parseDateValue(value) {
  if (value == null || value === '' || value === '—') return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

const STATUS_FALLBACKS = {
  subscriptions: ['Active', 'Inactive'],
  payments: ['Paid', 'Trial', 'Failed', 'Refunded'],
  foods: ['Approved', 'Pending', 'Rejected'],
  recipes: ['Published', 'Draft'],
  workouts: ['Published', 'Draft'],
  tracks: ['Published', 'Draft'],
  content: ['Published', 'Draft'],
  languages: ['ON', 'OFF'],
  notifications: ['Draft', 'Scheduled', 'Sent'],
  reports: ['Uploaded', 'Parsed', 'Failed'],
  support: ['Open', 'Pending', 'Resolved'],
  'ai-features': ['ON', 'OFF'],
  'ai-safety': ['ON', 'OFF'],
};

function optionsFromSeed(entity, key) {
  return Array.from(
    new Set(
      (entity.seed || [])
        .map((row) => {
          const value = row[key];
          if (typeof value === 'boolean') return value ? 'Yes' : 'No';
          return String(value ?? '').trim();
        })
        .filter(Boolean)
    )
  ).sort();
}

function getFieldOptions(col, entity) {
  if (col.options?.length) return col.options;

  if (!SELECT_KEYS.has(col.key)) return null;

  const fromSeed = optionsFromSeed(entity, col.key);
  if (fromSeed.length) return fromSeed;

  if (col.key === 'status') {
    return STATUS_FALLBACKS[entity.key] || ['Active', 'Inactive'];
  }

  if (col.key === 'enabled') return ['Yes', 'No'];

  return null;
}

function emptyForm(entity) {
  return entity.columns.reduce((acc, col) => {
    const options = getFieldOptions(col, entity);
    if (options?.length) {
      acc[col.key] = options[0];
    } else {
      acc[col.key] = '';
    }
    return acc;
  }, {});
}

function normalizeFormValue(col, value) {
  if (col.key === 'enabled') {
    if (value === true || value === 'true' || value === 'Yes') return 'Yes';
    if (value === false || value === 'false' || value === 'No') return 'No';
  }
  return value ?? '';
}

function serializeFormValue(col, value) {
  if (col.key === 'enabled') {
    return value === 'Yes' || value === true || value === 'true';
  }
  return value;
}

function getPrimaryKey(columns) {
  const preferred = [
    'name',
    'title',
    'user',
    'feature',
    'rule',
    'plan',
    'campaign',
    'actor',
    'key',
    'role',
  ];
  return preferred.find((key) => columns.some((col) => col.key === key)) || columns[0]?.key;
}

export function HealthlineEntityForm({ entityKey, currentRow = null }) {
  const router = useRouter();
  const entity = getHealthlineEntity(entityKey);
  const isEdit = !!currentRow;

  const primaryKey = useMemo(() => (entity ? getPrimaryKey(entity.columns) : null), [entity]);

  const [form, setForm] = useState(() => {
    if (!entity) return {};
    if (currentRow) {
      return entity.columns.reduce((acc, col) => {
        acc[col.key] = normalizeFormValue(col, currentRow[col.key]);
        return acc;
      }, {});
    }
    return emptyForm(entity);
  });
  const [loading, setLoading] = useState(false);
  const [openDateKey, setOpenDateKey] = useState(null);

  if (!entity) {
    return <Typography color="error">Unknown module.</Typography>;
  }

  const onCancel = () => {
    router.push(entity.listPath);
  };

  const onSubmit = async () => {
    if (primaryKey && !String(form[primaryKey] ?? '').trim()) {
      toast.error(
        `${entity.columns.find((c) => c.key === primaryKey)?.label || 'Field'} is required`
      );
      return;
    }

    setLoading(true);
    try {
      const row = {
        id: currentRow?.id || `new-${Date.now()}`,
      };
      entity.columns.forEach((col) => {
        row[col.key] = serializeFormValue(col, form[col.key]);
      });
      upsertEntityRow(entity.key, entity.seed, row);
      toast.success(isEdit ? 'Update success!' : 'Create success!');
      router.push(entity.listPath);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title={isEdit ? `Edit ${entity.singular}` : entity.createLabel}
        subheader={entity.description}
      />
      <CardContent>
        <Stack spacing={3}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            {entity.columns.map((col) => {
              const options = getFieldOptions(col, entity);
              const isSelect = !!options?.length;

              if (isDateColumn(col)) {
                return (
                  <DatePicker
                    key={col.key}
                    label={col.label}
                    value={parseDateValue(form[col.key])}
                    open={openDateKey === col.key}
                    onOpen={() => setOpenDateKey(col.key)}
                    onClose={() => setOpenDateKey(null)}
                    onChange={(newValue) => {
                      setForm((prev) => ({
                        ...prev,
                        [col.key]:
                          newValue && dayjs(newValue).isValid()
                            ? dayjs(newValue).format('YYYY-MM-DD')
                            : '',
                      }));
                    }}
                    format="YYYY-MM-DD"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        onClick: () => setOpenDateKey(col.key),
                        inputProps: { readOnly: true },
                        sx: { cursor: 'pointer', '& input': { cursor: 'pointer' } },
                      },
                    }}
                  />
                );
              }

              return (
                <TextField
                  key={col.key}
                  select={isSelect}
                  label={col.label}
                  value={form[col.key] ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [col.key]: e.target.value }))}
                  fullWidth
                >
                  {isSelect
                    ? options.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))
                    : null}
                </TextField>
              );
            })}
          </Box>

          <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
            <Button variant="outlined" color="inherit" onClick={onCancel}>
              Cancel
            </Button>
            <LoadingButton variant="contained" loading={loading} onClick={onSubmit}>
              Save
            </LoadingButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function loadEntityForEdit(entityKey, id) {
  const entity = getHealthlineEntity(entityKey);
  if (!entity) return null;
  return getEntityRow(entity.key, entity.seed, id);
}

export { entityCreatePath, entityEditPath, getHealthlineEntity } from './healthline-entities';
