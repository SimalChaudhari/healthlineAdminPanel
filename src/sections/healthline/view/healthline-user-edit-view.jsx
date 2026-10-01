'use client';

import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';

import axios, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlineUserForm } from '../user/healthline-user-form';

export function HealthlineUserEditView({ id }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(endpoints.users.details(id));
        if (active) setCurrentUser(res.data.user);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load user');
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
        heading="Edit user"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Users', href: paths.dashboard.users },
          { name: currentUser?.name || 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {loading ? (
        <LoadingScreen sx={{ py: 10, minHeight: 320 }} />
      ) : (
        currentUser && <HealthlineUserForm currentUser={currentUser} />
      )}
    </DashboardContent>
  );
}
