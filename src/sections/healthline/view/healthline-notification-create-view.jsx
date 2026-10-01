'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlineNotificationForm } from '../notification/healthline-notification-form';

export function HealthlineNotificationCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="New notification"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Notifications', href: paths.dashboard.notifications },
          { name: 'New' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <HealthlineNotificationForm />
    </DashboardContent>
  );
}
