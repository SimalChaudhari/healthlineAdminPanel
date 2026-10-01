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
  { id: 'label', label: 'Feature', width: 260 },
  { id: 'key', label: 'Key', width: 120 },
  { id: 'route', label: 'Route', width: 140 },
  { id: 'aiKey', label: 'AI key', width: 140 },
  { id: 'showInHub', label: 'In hub', width: 90 },
  { id: 'status', label: 'Status', width: 110 },
  { id: '', width: 88, align: 'right' },
];

// ----------------------------------------------------------------------

export function HealthlineFeaturesView() {
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'createdAt' });

  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  const loadFeatures = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${endpoints.features.list}?all=1`);
      setFeatures(res.data?.features || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load features');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const dataFiltered = useMemo(() => {
    const comparator = getComparator(table.order, table.orderBy);
    return [...features].sort(comparator);
  }, [features, table.order, table.orderBy]);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !loading && !dataFiltered.length;

  const onDelete = async (id) => {
    try {
      await axios.delete(endpoints.features.details(id));
      toast.success('Feature deleted');
      setConfirmId(null);
      table.setSelected([]);
      await loadFeatures();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete feature');
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="App Features"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'App Features' }]}
        action={
          <Button
            component={RouterLink}
            href={`${paths.dashboard.features}/new`}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add feature
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, mt: -2 }}>
        Catalog for the APK All features screen. AI-keyed features unlock via Subscription plans.
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
                        <Checkbox checked={selected} onClick={() => table.onSelectRow(row.id)} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: row.color || 'primary.main',
                              flexShrink: 0,
                            }}
                          />
                          <Stack sx={{ minWidth: 0, flex: '1 1 auto' }}>
                            <Box
                              component="span"
                              onClick={() =>
                                router.push(`${paths.dashboard.features}/${row.id}/edit`)
                              }
                              sx={{
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {row.label}
                            </Box>
                            {row.description ? (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.disabled',
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {row.description}
                              </Typography>
                            ) : null}
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell>{row.key}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.route || '—'}</TableCell>
                      <TableCell>
                        {row.aiKey ? (
                          <Label variant="soft" color="info">
                            {row.aiKey}
                          </Label>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>{row.showInHub ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <Label
                          variant="soft"
                          color={row.status === 'Active' ? 'success' : 'default'}
                        >
                          {row.status}
                        </Label>
                      </TableCell>
                      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
                        <HealthlineTableRowActions
                          onEdit={() => router.push(`${paths.dashboard.features}/${row.id}/edit`)}
                          onDelete={() => onDelete(row.id)}
                          confirmContent="Are you sure you want to delete this feature?"
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
        content="Are you sure you want to delete this feature?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => confirmId && onDelete(confirmId)}
          >
            Delete
          </Button>
        }
      />
    </DashboardContent>
  );
}
