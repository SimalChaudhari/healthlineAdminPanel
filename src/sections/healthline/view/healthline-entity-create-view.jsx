'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlineEntityForm, getHealthlineEntity } from '../healthline-entity-form';

export function HealthlineEntityCreateView({ entityKey }) {
  const entity = getHealthlineEntity(entityKey);

  if (!entity) return null;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={entity.createLabel}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: entity.title, href: entity.listPath },
          { name: 'New' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <HealthlineEntityForm entityKey={entityKey} />
    </DashboardContent>
  );
}
