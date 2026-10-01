'use client';

import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';

import axios, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlineFeatureForm } from '../feature/healthline-feature-form';

export function HealthlineFeatureEditView({ id }) {
  const [currentFeature, setCurrentFeature] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(endpoints.features.details(id));
        if (active) setCurrentFeature(res.data.feature);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load feature');
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
        heading="Edit feature"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'App Features', href: paths.dashboard.features },
          { name: currentFeature?.label || 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {loading ? (
        <LoadingScreen sx={{ py: 10, minHeight: 320 }} />
      ) : (
        currentFeature && <HealthlineFeatureForm currentFeature={currentFeature} />
      )}
    </DashboardContent>
  );
}
