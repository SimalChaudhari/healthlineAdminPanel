'use client';

import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';

import axios, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlineFoodForm } from '../food/healthline-food-form';

export function HealthlineFoodEditView({ id }) {
  const [currentFood, setCurrentFood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${endpoints.foods.details(id)}?admin=1`);
        if (active) setCurrentFood(res.data.food);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load food');
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
        heading="Edit food"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Food Database', href: paths.dashboard.foods },
          { name: currentFood?.name || 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {loading ? (
        <LoadingScreen sx={{ py: 10, minHeight: 320 }} />
      ) : (
        currentFood && <HealthlineFoodForm currentFood={currentFood} />
      )}
    </DashboardContent>
  );
}
