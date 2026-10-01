'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fNumber, fShortenNumber } from 'src/utils/format-number';
import axios, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const REFRESH_MS = 60000;

function fInr(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function buildCards(s) {
  return [
    { label: 'Users', value: fNumber(s.totalUsers), note: `+${s.newLast7Days} in last 7 days` },
    { label: 'Active today', value: fNumber(s.activeToday), note: `${s.activeTodayPct}% of users opened the app` },
    { label: 'New users', value: fNumber(s.newToday), note: 'Signed up today' },
    { label: 'Premium', value: fNumber(s.premium), note: `${s.conversionPct}% on a paid plan` },
    { label: 'Est. monthly revenue', value: fInr(s.estimatedMrr), note: 'Paid plans × monthly price (not payments)' },
    { label: 'Logged food today', value: fNumber(s.loggedFoodToday), note: `${fNumber(s.mealsToday)} meal items` },
    { label: 'Active (7 days)', value: fNumber(s.active7d), note: `${fNumber(s.blocked)} blocked accounts` },
    { label: 'AI requests', value: null, note: 'Not tracked yet' },
  ];
}

// ----------------------------------------------------------------------

export function HealthlineDashboardView() {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await axios.get(endpoints.dashboard.stats);
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err?.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const chart = data?.charts;
  const categories = chart?.categories || [];

  const usersChartOptions = useChart({
    colors: [theme.palette.primary.main, theme.palette.info.main, theme.palette.warning.main],
    xaxis: { categories },
    stroke: { width: 2 },
    tooltip: { y: { formatter: (value) => fNumber(value) } },
  });

  const diaryChartOptions = useChart({
    colors: [theme.palette.success.main],
    xaxis: { categories },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
    yaxis: { labels: { formatter: (value) => fNumber(value) } },
    tooltip: { y: { formatter: (value) => `${fNumber(value)} users` } },
  });

  const mealsChartOptions = useChart({
    colors: [theme.palette.primary.dark],
    xaxis: { categories },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '48%' } },
    tooltip: { y: { formatter: (value) => fNumber(value) } },
  });

  const plans = chart?.plans || [];
  const planTotal = plans.reduce((n, p) => n + p.value, 0);
  const planColors = [
    hexAlpha(theme.palette.grey[500], 0.32),
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const planChartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: planColors,
    labels: plans.map((item) => item.label),
    stroke: { width: 0 },
    tooltip: {
      y: {
        formatter: (value) => fNumber(value),
        title: { formatter: (seriesName) => seriesName },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            value: { formatter: (value) => fShortenNumber(value) },
            total: {
              label: 'Users',
              formatter: (w) => fShortenNumber(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
            },
          },
        },
      },
    },
  });

  const engagement = chart?.engagement || [];
  const engagementChartOptions = useChart({
    colors: [theme.palette.info.main],
    xaxis: { categories: engagement.map((item) => item.label) },
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '48%' } },
    tooltip: { y: { formatter: (value) => fNumber(value) } },
  });

  const updated = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Overview' }]}
        action={
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:restart-bold" />}
            onClick={() => {
              setLoading(true);
              load();
            }}
          >
            Refresh
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, mt: -2 }}>
        Live HealthLine snapshot from the database{updated ? ` · updated ${updated}` : ''} · days in
        India time (IST). Refreshes every minute.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        gap={2}
        display="grid"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
        sx={{ mb: 3 }}
      >
        {(data ? buildCards(data.stats) : Array.from({ length: 8 }, (_, i) => ({ label: i }))).map(
          (item) => (
            <Card key={item.label}>
              <CardContent>
                {data ? (
                  <>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      {item.label}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ mt: 1, color: item.value == null ? 'text.disabled' : 'text.primary' }}
                    >
                      {item.value ?? '—'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {item.note}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Skeleton width="50%" />
                    <Skeleton height={44} width="40%" />
                    <Skeleton width="70%" />
                  </>
                )}
              </CardContent>
            </Card>
          )
        )}
      </Box>

      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        sx={{ mb: 3 }}
      >
        <Card>
          <CardHeader title="Users trend" subheader="Total · Active (opened app) · New — last 7 days" sx={{ mb: 3 }} />
          {chart ? (
            <Chart
              type="line"
              series={[
                { name: 'Total users', data: chart.users.total },
                { name: 'Active users', data: chart.users.active },
                { name: 'New users', data: chart.users.newUsers },
              ]}
              options={usersChartOptions}
              height={300}
              sx={{ py: 2.5, pl: 1, pr: 2.5 }}
            />
          ) : (
            <Skeleton variant="rounded" height={300} sx={{ m: 3 }} />
          )}
        </Card>

        <Card>
          <CardHeader title="Diary activity" subheader="Users who logged food — last 7 days" sx={{ mb: 3 }} />
          {chart ? (
            <Chart
              type="area"
              series={[{ name: 'Users logging', data: chart.diary.loggers }]}
              options={diaryChartOptions}
              height={300}
              sx={{ py: 2.5, pl: 1, pr: 2.5 }}
            />
          ) : (
            <Skeleton variant="rounded" height={300} sx={{ m: 3 }} />
          )}
        </Card>

        <Card>
          <CardHeader title="Meals logged" subheader="Food items added to diaries — last 7 days" sx={{ mb: 3 }} />
          {chart ? (
            <Chart
              type="bar"
              series={[{ name: 'Meal items', data: chart.diary.meals }]}
              options={mealsChartOptions}
              height={300}
              sx={{ py: 2.5, pl: 1, pr: 2.5 }}
            />
          ) : (
            <Skeleton variant="rounded" height={300} sx={{ m: 3 }} />
          )}
        </Card>

        <Card>
          <CardHeader title="Plan mix" subheader="Users on each subscription plan" />
          {chart && planTotal > 0 ? (
            <>
              <Chart
                type="donut"
                series={plans.map((item) => item.value)}
                options={planChartOptions}
                width={{ xs: 220, xl: 240 }}
                height={{ xs: 220, xl: 240 }}
                sx={{ mx: 'auto', my: 3 }}
              />
              <Divider sx={{ borderStyle: 'dashed' }} />
              <ChartLegends
                labels={planChartOptions?.labels}
                colors={planChartOptions?.colors}
                values={plans.map((item) => fShortenNumber(item.value) || '0')}
                sx={{ p: 3, justifyContent: 'center' }}
              />
            </>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary', p: 3 }}>
              {chart ? 'No app users yet.' : 'Loading…'}
            </Typography>
          )}
        </Card>
      </Box>

      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: '2fr 1.4fr' }}
        sx={{ mb: 3 }}
      >
        <Card>
          <CardHeader title="Engagement" subheader="Last 7 days (favourites: all time)" sx={{ mb: 3 }} />
          {chart ? (
            <Chart
              type="bar"
              series={[{ name: 'Count', data: engagement.map((item) => item.value) }]}
              options={engagementChartOptions}
              height={280}
              sx={{ py: 2.5, pl: 1, pr: 2.5 }}
            />
          ) : (
            <Skeleton variant="rounded" height={280} sx={{ m: 3 }} />
          )}
        </Card>

        <Card>
          <CardHeader
            title="Recent users"
            subheader="Newest sign-ups"
            action={
              <Button component={RouterLink} href={paths.dashboard.users} size="small">
                View all
              </Button>
            }
          />
          <TableContainer sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.recentUsers || []).map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        href={paths.dashboard.usersEdit(u.id)}
                        color="inherit"
                        variant="subtitle2"
                      >
                        {u.name}
                      </Link>
                      <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                        {u.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{u.plan}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="soft"
                        label={u.status}
                        color={u.status === 'Blocked' ? 'error' : u.status === 'Trial' ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{u.joined}</TableCell>
                  </TableRow>
                ))}
                {data && !data.recentUsers?.length && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ color: 'text.secondary' }}>
                      No app users yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {loading && !data ? 'Loading live data… ' : ''}
        Payments, AI requests and uploaded reports are not recorded in the database yet, so they are
        not shown as numbers. Estimated revenue uses each paid user&apos;s plan price, not real
        payments.
      </Typography>
    </DashboardContent>
  );
}
