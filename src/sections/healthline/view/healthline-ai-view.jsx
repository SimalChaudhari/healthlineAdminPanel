'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlineCrudTable } from '../healthline-crud-table';
import {
  deleteEntityRow,
  entityCreatePath,
  entityEditPath,
  getEntityRows,
  getHealthlineEntity,
} from '../healthline-entities';

const STATS = [
  { label: 'Requests today', value: '42,812' },
  { label: 'Est. cost', value: '₹27,500' },
  { label: 'Errors', value: '18' },
  { label: 'Medical AI', value: 'OFF' },
];

function useEntityTable(entityKey) {
  const entity = getHealthlineEntity(entityKey);
  const [rows, setRows] = useState(() => getEntityRows(entity.key, entity.seed));

  const onDeleteRow = useMemo(
    () => (id) => {
      setRows(deleteEntityRow(entity.key, entity.seed, id));
    },
    [entity]
  );

  return {
    entity,
    rows,
    createHref: entityCreatePath(entity),
    getEditHref: (row) => entityEditPath(entity, row.id),
    onDeleteRow,
  };
}

export function HealthlineAiView() {
  const features = useEntityTable('ai-features');
  const safety = useEntityTable('ai-safety');

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="AI"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'AI' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, mt: -2 }}>
        Feature flags, usage, and safety. Assist only — do not diagnose.
      </Typography>

      <Box
        gap={2}
        display="grid"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
        sx={{ mb: 3 }}
      >
        {STATS.map((item) => (
          <Card key={item.label}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {item.label}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <HealthlineCrudTable
        title="Features"
        createLabel={features.entity.createLabel}
        searchPlaceholder={features.entity.searchPlaceholder}
        filterKeys={features.entity.filterKeys}
        columns={features.entity.columns}
        rows={features.rows}
        createHref={features.createHref}
        getEditHref={features.getEditHref}
        onDeleteRow={features.onDeleteRow}
        sx={{ mb: 3 }}
      />

      <HealthlineCrudTable
        title="Safety rules"
        createLabel={safety.entity.createLabel}
        searchPlaceholder={safety.entity.searchPlaceholder}
        filterKeys={safety.entity.filterKeys}
        columns={safety.entity.columns}
        rows={safety.rows}
        createHref={safety.createHref}
        getEditHref={safety.getEditHref}
        onDeleteRow={safety.onDeleteRow}
      />
    </DashboardContent>
  );
}
