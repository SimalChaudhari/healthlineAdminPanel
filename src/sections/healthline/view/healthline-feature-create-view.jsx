'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlineFeatureForm } from '../feature/healthline-feature-form';

export function HealthlineFeatureCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new feature"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'App Features', href: paths.dashboard.features },
          { name: 'New feature' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <HealthlineFeatureForm />
    </DashboardContent>
  );
}
