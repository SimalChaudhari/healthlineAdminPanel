'use client';

import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlineCrudTable } from './healthline-crud-table';
import {
  entityCreatePath,
  entityEditPath,
  getEntityRows,
  getHealthlineEntity,
  deleteEntityRow,
} from './healthline-entities';

// ----------------------------------------------------------------------

export function HealthlineModuleView({
  entityKey,
  title,
  description,
  breadcrumbs,
  columns = [],
  rows = [],
  stats = [],
  note,
  filterKeys,
  searchPlaceholder = 'Search...',
  createLabel = 'Add new',
}) {
  const entity = entityKey ? getHealthlineEntity(entityKey) : null;

  const resolved = {
    title: entity?.title || title,
    description: entity?.description || description,
    columns: entity?.columns || columns,
    filterKeys: entity?.filterKeys || filterKeys,
    searchPlaceholder: entity?.searchPlaceholder || searchPlaceholder,
    createLabel: entity?.createLabel || createLabel,
    seed: entity?.seed || rows,
    listPath: entity?.listPath,
    createHref: entity ? entityCreatePath(entity) : null,
    getEditHref: entity ? (row) => entityEditPath(entity, row.id) : null,
  };

  const [tableRows, setTableRows] = useState(() =>
    entity ? getEntityRows(entity.key, entity.seed) : rows
  );

  // Refresh from in-memory store when returning from create/edit pages
  useEffect(() => {
    if (entity) {
      setTableRows(getEntityRows(entity.key, entity.seed));
    }
  }, [entity]);

  const createHref = resolved.createHref;
  const getEditHref = resolved.getEditHref;

  const onDelete = useMemo(() => {
    if (!entity) return undefined;
    return (id) => {
      const next = deleteEntityRow(entity.key, entity.seed, id);
      setTableRows(next);
    };
  }, [entity]);

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading={resolved.title}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          ...(breadcrumbs || [{ name: resolved.title }]),
        ]}
        action={
          !!resolved.columns.length &&
          createHref && (
            <Button
              component={RouterLink}
              href={createHref}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {resolved.createLabel}
            </Button>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {resolved.description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, mt: -2 }}>
          {resolved.description}
        </Typography>
      )}

      {!!stats.length && (
        <Box
          gap={2}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
          sx={{ mb: 3 }}
        >
          {stats.map((item) => (
            <Card key={item.label}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  {item.label}
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {item.value}
                </Typography>
                {item.change && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {item.change}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {note && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 2 }}>
          {note}
        </Typography>
      )}

      {!!resolved.columns.length && (
        <HealthlineCrudTable
          columns={resolved.columns}
          rows={tableRows}
          filterKeys={resolved.filterKeys}
          searchPlaceholder={resolved.searchPlaceholder}
          createLabel={resolved.createLabel}
          createHref={createHref}
          getEditHref={getEditHref}
          onDeleteRow={onDelete}
          showCreateButton={false}
        />
      )}

      {!resolved.columns.length && !stats.length && (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            height: 240,
            borderRadius: 2,
            border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
          }}
        >
          <Typography color="text.secondary">No static data yet</Typography>
        </Stack>
      )}
    </DashboardContent>
  );
}
