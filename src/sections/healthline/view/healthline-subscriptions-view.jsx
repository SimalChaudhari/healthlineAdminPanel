'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import axios, { endpoints } from 'src/utils/axios';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { HealthlineTableRowActions } from '../healthline-table-row-actions';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Plan' },
  { id: 'code', label: 'Code' },
  { id: 'priceMonthly', label: 'Monthly' },
  { id: 'priceYearly', label: 'Yearly' },
  { id: 'highlight', label: 'Popular' },
  { id: 'aiFeatures', label: 'AI unlocks' },
  { id: 'status', label: 'Status' },
  { id: 'sortOrder', label: 'Order', width: 80 },
  { id: '', width: 88, align: 'right' },
];

// ----------------------------------------------------------------------

export function HealthlineSubscriptionsView() {
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'sortOrder' });

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${endpoints.plans.list}?all=1`);
      setPlans(res.data?.plans || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const dataFiltered = useMemo(() => {
    const comparator = getComparator(table.order, table.orderBy);
    return [...plans].sort(comparator);
  }, [plans, table.order, table.orderBy]);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !loading && !dataFiltered.length;

  const onDelete = async (id) => {
    try {
      await axios.delete(endpoints.plans.details(id));
      toast.success('Plan deleted');
      setConfirmId(null);
      table.setSelected([]);
      await loadPlans();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete plan');
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Subscriptions"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Subscriptions' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={`${paths.dashboard.subscriptions}/new`}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add plan
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, mt: -2 }}>
        Add and edit plans shown on the Healthline app Subscription screen.
      </Typography>

      <Card>
        <TableSelectedAction
          dense={table.dense}
          numSelected={table.selected.length}
          rowCount={dataFiltered.length}
          onSelectAllRows={(checked) =>
            table.onSelectAllRows(
              checked,
              dataFiltered.map((row) => row.id)
            )
          }
          action={
            <Tooltip title="Delete">
              <IconButton
                color="primary"
                onClick={() => {
                  if (table.selected[0]) setConfirmId(table.selected[0]);
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          }
        />

        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={dataFiltered.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
            />

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={TABLE_HEAD.length + 1} sx={{ p: 0, border: 'none' }}>
                    <LoadingScreen sx={{ py: 10, minHeight: 280 }} />
                  </TableCell>
                </TableRow>
              ) : (
                dataInPage.map((row) => {
                  const selected = table.selected.includes(row.id);
                  return (
                    <TableRow key={row.id} hover selected={selected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected}
                          onClick={() => table.onSelectRow(row.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Box
                            component="span"
                            onClick={() =>
                              router.push(`${paths.dashboard.subscriptions}/${row.id}/edit`)
                            }
                            sx={{ cursor: 'pointer', fontWeight: 600 }}
                          >
                            {row.name}
                          </Box>
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            {row.tagline || '—'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{row.code}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        ₹{Number(row.priceMonthly || 0).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {row.priceYearly == null || row.priceYearly === ''
                          ? '—'
                          : `₹${Number(row.priceYearly).toLocaleString('en-IN')}`}
                      </TableCell>
                      <TableCell>
                        {row.highlight ? (
                          <Label variant="soft" color="info">
                            Popular
                          </Label>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {(row.aiFeatures || []).length
                          ? `${row.aiFeatures.length} AI`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Label
                          variant="soft"
                          color={row.status === 'Active' ? 'success' : 'default'}
                        >
                          {row.status}
                        </Label>
                      </TableCell>
                      <TableCell>{row.sortOrder}</TableCell>
                      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
                        <HealthlineTableRowActions
                          onEdit={() =>
                            router.push(`${paths.dashboard.subscriptions}/${row.id}/edit`)
                          }
                          onDelete={() => onDelete(row.id)}
                          confirmContent="Are you sure you want to delete this plan?"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}

              <TableEmptyRows
                height={table.dense ? 56 : 76}
                emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
              />
              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </Scrollbar>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="Delete"
        content="Are you sure you want to delete this plan?"
        action={
          <Button variant="contained" color="error" onClick={() => confirmId && onDelete(confirmId)}>
            Delete
          </Button>
        }
      />
    </DashboardContent>
  );
}
