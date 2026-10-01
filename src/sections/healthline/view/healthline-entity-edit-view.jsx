'use client';

import { useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import {
  HealthlineEntityForm,
  getHealthlineEntity,
  loadEntityForEdit,
} from '../healthline-entity-form';

export function HealthlineEntityEditView({ entityKey, id }) {
  const entity = getHealthlineEntity(entityKey);
  const [currentRow, setCurrentRow] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCurrentRow(loadEntityForEdit(entityKey, id));
    setReady(true);
  }, [entityKey, id]);

  if (!entity) return null;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={`Edit ${entity.singular}`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: entity.title, href: entity.listPath },
          { name: 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {!ready ? null : !currentRow ? (
        <Typography color="text.secondary">Record not found.</Typography>
      ) : (
        <HealthlineEntityForm entityKey={entityKey} currentRow={currentRow} />
      )}
    </DashboardContent>
  );
}
