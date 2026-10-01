'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlineFoodForm } from '../food/healthline-food-form';

export function HealthlineFoodCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new food"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Food Database', href: paths.dashboard.foods },
          { name: 'New food' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <HealthlineFoodForm />
    </DashboardContent>
  );
}
