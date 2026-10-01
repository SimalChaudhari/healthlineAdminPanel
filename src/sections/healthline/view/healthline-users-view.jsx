'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import axios, { endpoints } from 'src/utils/axios';
import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
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

// ----------------------------------------------------------------------

const STATUS_TABS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'Active', label: 'Active', color: 'success' },
  { value: 'Trial', label: 'Trial', color: 'warning' },
  { value: 'Blocked', label: 'Blocked', color: 'error' },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'phoneNumber', label: 'Phone number', width: 160 },
  { id: 'plan', label: 'Plan', width: 100 },
  { id: 'goal', label: 'Goal', width: 110 },
  { id: 'calories', label: 'Kcal', width: 90 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'joined', label: 'Joined', width: 120 },
  { id: '', width: 88 },
];

function statusColor(status) {
  if (status === 'Active') return 'success';
  if (status === 'Trial') return 'warning';
  if (status === 'Blocked') return 'error';
  return 'default';
}

function stringAvatar(name) {
  const text = String(name || '?').trim();
  const parts = text.split(/\s+/);
  return (parts.length > 1 ? `${parts[0][0] || ''}${parts[1][0] || ''}` : text.slice(0, 2)).toUpperCase();
}

// ----------------------------------------------------------------------

function UserRow({ row, selected, onSelectRow, onEditRow, onDeleteRow }) {
  const popover = usePopover();
  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack spacing={2} direction="row" alignItems="center">
            <Avatar alt={row.name} src={row.photoURL || undefined}>
              {stringAvatar(row.name)}
            </Avatar>
            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Box
                component="span"
                onClick={onEditRow}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              >
                {row.name}
              </Box>
              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row.email}
              </Box>
            </Stack>
          </Stack>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.phoneNumber || '—'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.plan}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
          {row.profile?.goal || '—'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.profile?.calories != null ? row.profile.calories : '—'}
        </TableCell>
        <TableCell>
          <Label variant="soft" color={statusColor(row.status)}>
            {row.status}
          </Label>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.joined || '—'}</TableCell>

        <TableCell align="right">
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Tooltip title="Edit" placement="top" arrow>
              <IconButton onClick={onEditRow}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

export function HealthlineUsersView() {
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 5 });
  const toolbarMenu = usePopover();
  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints.users.list);
      setTableData(res.data.users || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const dataFiltered = useMemo(() => {
    const filtered = tableData.filter((row) => {
      if (statusTab !== 'all' && row.status !== statusTab) return false;
      if (planFilter !== 'all' && row.plan !== planFilter) return false;

      const q = search.trim().toLowerCase();
      if (!q) return true;

      return [row.name, row.email, row.phoneNumber, row.plan, row.role, row.status]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });

    return filtered.sort(getComparator(table.order, table.orderBy));
  }, [tableData, statusTab, planFilter, search, table.order, table.orderBy]);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const handleDeleteRow = async (id) => {
    try {
      await axios.delete(endpoints.users.details(id));
      setTableData((prev) => prev.filter((row) => row.id !== id));
      toast.success('Delete success!');
      table.onUpdatePageDeleteRow(dataInPage.length);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete user');
    }
  };

  const handleDeleteRows = async () => {
    try {
      await Promise.all(table.selected.map((id) => axios.delete(endpoints.users.details(id))));
      setTableData((prev) => prev.filter((row) => !table.selected.includes(row.id)));
      toast.success('Delete success!');
      table.onUpdatePageDeleteRows({
        totalRowsInPage: dataInPage.length,
        totalRowsFiltered: dataFiltered.length,
      });
      confirm.onFalse();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete users');
    }
  };

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Users"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Users' }]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.usersNew}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New user
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={statusTab}
            onChange={(_, value) => {
              setStatusTab(value);
              table.onResetPage();
            }}
            sx={{
              px: 2.5,
              boxShadow: (theme) =>
                `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }}
          >
            {STATUS_TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === statusTab) && 'filled') || 'soft'
                    }
                    color={tab.color}
                  >
                    {tab.value === 'all'
                      ? tableData.length
                      : tableData.filter((row) => row.status === tab.value).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Stack
            spacing={2}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            direction={{ xs: 'column', md: 'row' }}
            sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
          >
            <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
              <InputLabel>Plan</InputLabel>
              <Select
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value);
                  table.onResetPage();
                }}
                input={<OutlinedInput label="Plan" />}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Free">Free</MenuItem>
                <MenuItem value="Plus">Plus</MenuItem>
                <MenuItem value="Family">Family</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
              <TextField
                fullWidth
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  table.onResetPage();
                }}
                placeholder="Search..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton onClick={toolbarMenu.onOpen}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            </Stack>
          </Stack>

          <CustomPopover
            open={toolbarMenu.open}
            anchorEl={toolbarMenu.anchorEl}
            onClose={toolbarMenu.onClose}
            slotProps={{ arrow: { placement: 'right-top' } }}
          >
            <MenuList>
              <MenuItem onClick={toolbarMenu.onClose}>
                <Iconify icon="solar:printer-minimalistic-bold" />
                Print
              </MenuItem>
              <MenuItem onClick={toolbarMenu.onClose}>
                <Iconify icon="solar:import-bold" />
                Import
              </MenuItem>
              <MenuItem onClick={toolbarMenu.onClose}>
                <Iconify icon="solar:export-bold" />
                Export
              </MenuItem>
            </MenuList>
          </CustomPopover>

          <Box sx={{ position: 'relative' }}>
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
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            {loading ? (
              <LoadingScreen sx={{ py: 10, minHeight: 280 }} />
            ) : (
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
                    {dataInPage.map((row) => (
                      <UserRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onEditRow={() => router.push(paths.dashboard.usersEdit(row.id))}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                      />
                    ))}

                    <TableEmptyRows
                      height={table.dense ? 56 : 56 + 20}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    <TableNoData notFound={!dataFiltered.length} />
                  </TableBody>
                </Table>
              </Scrollbar>
            )}
          </Box>

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
      </DashboardContent>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong>{table.selected.length}</strong> items?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleDeleteRows}>
            Delete
          </Button>
        }
      />
    </>
  );
}
