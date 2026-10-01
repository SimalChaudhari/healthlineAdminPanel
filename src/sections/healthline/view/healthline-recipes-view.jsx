'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import axios, { endpoints } from 'src/utils/axios';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
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
  { id: 'title', label: 'Recipe', width: 260 },
  { id: 'timeMinutes', label: 'Time', width: 90 },
  { id: 'calories', label: 'Cal', width: 80 },
  { id: 'protein', label: 'P', width: 70 },
  { id: 'carbs', label: 'C', width: 70 },
  { id: 'fat', label: 'F', width: 70 },
  { id: 'tags', label: 'Tags', width: 200 },
  { id: 'status', label: 'Status', width: 110 },
  { id: '', width: 88, align: 'right' },
];

// ----------------------------------------------------------------------

export function HealthlineRecipesView() {
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'createdAt' });

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ all: '1' });
      if (search.trim()) params.set('q', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await axios.get(`${endpoints.recipes.list}?${params.toString()}`);
      setRecipes(res.data?.recipes || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load recipes');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const dataFiltered = useMemo(() => {
    const comparator = getComparator(table.order, table.orderBy);
    return [...recipes].sort(comparator);
  }, [recipes, table.order, table.orderBy]);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !loading && !dataFiltered.length;

  const onDelete = async (id) => {
    try {
      await axios.delete(endpoints.recipes.details(id));
      toast.success('Recipe deleted');
      setConfirmId(null);
      table.setSelected([]);
      await loadRecipes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete recipe');
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Recipes"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Recipes' }]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.recipesNew}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add recipe
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, mt: -2 }}>
        Recipes for the APK Discover tab. Only Active recipes are shown in the app.
      </Typography>

      <Card>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
          sx={{ p: 2.5 }}
        >
          <TextField
            fullWidth
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              table.onResetPage();
            }}
            placeholder="Search title or tags..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              table.onResetPage();
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
        </Stack>

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
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            alt={row.title}
                            src={row.imageUrl || undefined}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          >
                            {String(row.title || '?')
                              .charAt(0)
                              .toUpperCase()}
                          </Avatar>
                          <Stack spacing={0.5}>
                            <Typography
                              variant="subtitle2"
                              sx={{ cursor: 'pointer' }}
                              onClick={() => router.push(paths.dashboard.recipesEdit(row.id))}
                            >
                              {row.title}
                            </Typography>
                            {row.featured ? (
                              <Label variant="soft" color="warning" sx={{ alignSelf: 'flex-start' }}>
                                Chef&apos;s pick
                              </Label>
                            ) : null}
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.timeMinutes} min</TableCell>
                      <TableCell>{row.calories}</TableCell>
                      <TableCell>{row.protein}</TableCell>
                      <TableCell>{row.carbs}</TableCell>
                      <TableCell>{row.fat}</TableCell>
                      <TableCell>{row.tags?.length ? row.tags.join(', ') : '—'}</TableCell>
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
                          onEdit={() => router.push(paths.dashboard.recipesEdit(row.id))}
                          onDelete={() => onDelete(row.id)}
                          confirmContent="Are you sure you want to delete this recipe?"
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
        content="Are you sure you want to delete this recipe?"
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
