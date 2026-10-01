'use client';

import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';

import axios, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlinePlanForm } from '../plan/healthline-plan-form';

export function HealthlinePlanEditView({ id }) {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(endpoints.plans.details(id));
        if (active) setCurrentPlan(res.data.plan);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load plan');
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
        heading="Edit plan"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Subscriptions', href: paths.dashboard.subscriptions },
          { name: currentPlan?.name || 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {loading ? (
        <LoadingScreen sx={{ py: 10, minHeight: 320 }} />
      ) : (
        currentPlan && <HealthlinePlanForm currentPlan={currentPlan} />
      )}
    </DashboardContent>
  );
}
