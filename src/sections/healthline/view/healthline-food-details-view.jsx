'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import axios, { endpoints } from 'src/utils/axios';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

function statusColor(status) {
  if (status === 'Approved') return 'success';
  if (status === 'Pending') return 'warning';
  if (status === 'Rejected' || status === 'Archived') return 'error';
  return 'default';
}

function InfoRow({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2">{value || '—'}</Typography>
    </Stack>
  );
}

function MacroCard({ label, value, unit = 'g' }) {
  return (
    <Card sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h4">{value ?? 0}</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
        {unit ? ` (${unit})` : ''}
      </Typography>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function HealthlineFoodDetailsView({ id }) {
  const router = useRouter();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${endpoints.foods.details(id)}?admin=1`);
        if (active) setFood(res.data.food);
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
        heading={food?.name || 'Food details'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Food Database', href: paths.dashboard.foods },
          { name: food?.name || 'Details' },
        ]}
        action={
          food ? (
            <Stack direction="row" spacing={1.5}>
              <Button
                component={RouterLink}
                href={paths.dashboard.foods}
                variant="outlined"
                color="inherit"
              >
                Back
              </Button>
              <Button
                component={RouterLink}
                href={paths.dashboard.foodsEdit(food.id)}
                variant="contained"
                startIcon={<Iconify icon="solar:pen-bold" />}
              >
                Edit
              </Button>
            </Stack>
          ) : null
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {loading ? (
        <LoadingScreen sx={{ py: 10, minHeight: 320 }} />
      ) : !food ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            Food not found
          </Typography>
          <Button variant="contained" onClick={() => router.push(paths.dashboard.foods)}>
            Back to Food Database
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack alignItems="center" spacing={2}>
                <Avatar
                  alt={food.name}
                  src={food.imageUrl || undefined}
                  variant="rounded"
                  sx={{ width: 1, maxWidth: 280, height: 220 }}
                >
                  {String(food.name || '?')
                    .charAt(0)
                    .toUpperCase()}
                </Avatar>
                <Typography variant="h5" textAlign="center">
                  {food.name}
                </Typography>
                <Label variant="soft" color={statusColor(food.status)}>
                  {food.status}
                </Label>
                {food.brand ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {food.brand}
                  </Typography>
                ) : null}
              </Stack>
            </Card>
          </Grid>

          <Grid xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Nutrition
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid xs={6} sm={3}>
                  <MacroCard label="Calories" value={food.calories} unit="kcal" />
                </Grid>
                <Grid xs={6} sm={3}>
                  <MacroCard label="Protein" value={food.protein} />
                </Grid>
                <Grid xs={6} sm={3}>
                  <MacroCard label="Carbs" value={food.carbs} />
                </Grid>
                <Grid xs={6} sm={3}>
                  <MacroCard label="Fat" value={food.fat} />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Details
              </Typography>
              <Box
                rowGap={2.5}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
              >
                <InfoRow label="Serving" value={food.serving} />
                <InfoRow label="Barcode" value={food.barcode} />
                <InfoRow label="Cuisine" value={food.cuisine} />
                <InfoRow label="Category" value={food.category} />
                <InfoRow label="Fiber (g)" value={food.fiber} />
                <InfoRow label="Sugar (g)" value={food.sugar} />
                <InfoRow label="Sodium (mg)" value={food.sodium} />
                <InfoRow label="Sort order" value={food.sortOrder} />
                <InfoRow
                  label="Tags"
                  value={Array.isArray(food.tags) && food.tags.length ? food.tags.join(', ') : '—'}
                />
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}
    </DashboardContent>
  );
}
