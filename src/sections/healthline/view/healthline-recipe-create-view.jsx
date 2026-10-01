'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { HealthlineRecipeForm } from '../recipe/healthline-recipe-form';

export function HealthlineRecipeCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new recipe"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Recipes', href: paths.dashboard.recipes },
          { name: 'New recipe' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <HealthlineRecipeForm />
    </DashboardContent>
  );
}
