'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlinePlanForm } from '../plan/healthline-plan-form';

export function HealthlinePlanCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new plan"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Subscriptions', href: paths.dashboard.subscriptions },
          { name: 'New plan' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <HealthlinePlanForm />
    </DashboardContent>
  );
}
