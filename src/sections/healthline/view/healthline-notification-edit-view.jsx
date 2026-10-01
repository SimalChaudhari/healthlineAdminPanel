'use client';

import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';

import axios, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlineNotificationForm } from '../notification/healthline-notification-form';

export function HealthlineNotificationEditView({ id }) {
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(endpoints.notifications.details(id));
        if (active) setCurrent(res.data.notification);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load notification');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit notification"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Notifications', href: paths.dashboard.notifications },
          { name: current?.title || 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {loading ? (
        <LoadingScreen sx={{ py: 10, minHeight: 320 }} />
      ) : (
        current && <HealthlineNotificationForm currentNotification={current} />
      )}
    </DashboardContent>
  );
}
