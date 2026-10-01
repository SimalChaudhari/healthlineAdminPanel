'use client';

import { useMemo, useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
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

function statusColor(value) {
  const v = String(value || '').toLowerCase();
  if (['active', 'paid', 'published', 'approved', 'on', 'resolved', 'parsed', 'sent'].includes(v))
    return 'success';
  if (['pending', 'trial', 'draft', 'scheduled', 'uploaded', 'open'].includes(v)) return 'warning';
  if (['blocked', 'banned', 'failed', 'refunded', 'off', 'needs edit', 'rejected'].includes(v))
    return 'error';
  if (['escalate', 'safeguard', 'safety response', 'high'].includes(v)) return 'error';
  if (['medium'].includes(v)) return 'warning';
  if (['low', 'block'].includes(v)) return 'info';
  return 'default';
}

function isBadgeColumn(key) {
  return ['status', 'action', 'review', 'priority', 'enabled'].includes(key);
}

function formatCell(value) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value ?? '—';
}

function getPrimaryKey(columns) {
  const preferred = [
    'name',
    'title',
    'user',
    'feature',
    'rule',
    'plan',
    'campaign',
    'actor',
    'key',
    'role',
  ];
  return preferred.find((key) => columns.some((col) => col.key === key)) || columns[0]?.key;
}

function getSecondaryKey(columns, primaryKey) {
  const preferred = ['email', 'issue', 'access', 'subtitle', 'code', 'target'];
  return preferred.find((key) => key !== primaryKey && columns.some((col) => col.key === key));
}

function getFilterKeys(columns, filterKeys) {
  if (filterKeys?.length) return filterKeys.filter((key) => key !== 'status');
  return columns
    .map((col) => col.key)
    .filter((key) =>
      [
        'plan',
        'channel',
        'type',
        'priority',
        'role',
        'cuisine',
        'meal',
        'level',
        'place',
        'focus',
        'lang',
        'group',
        'billing',
        'method',
        'review',
        'feature',
        'category',
      ].includes(key)
    );
}

// ----------------------------------------------------------------------

function RowActions({ onEdit, onDelete }) {
  const popover = usePopover();
  const [openConfirm, setOpenConfirm] = useState(false);

  return (
    <>
      <Stack direction="row" alignItems="center">
        <Tooltip title="Edit" placement="top" arrow>
          <IconButton onClick={onEdit}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>

        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              onEdit();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem
            onClick={() => {
              setOpenConfirm(true);
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
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDelete();
              setOpenConfirm(false);
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

export const HealthlineCrudTable = forwardRef(
  (
    {
      title,
      columns = [],
      rows = [],
      filterKeys,
      searchPlaceholder = 'Search...',
      createLabel = 'Add new',
      createHref,
      getEditHref,
      onDeleteRow,
      showCreateButton = true,
      sx,
    },
    ref
  ) => {
    const router = useRouter();
    const table = useTable({ defaultRowsPerPage: 5 });
    const toolbarMenu = usePopover();

    const [tableData, setTableData] = useState(rows);
    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [filters, setFilters] = useState({});
    const [bulkConfirm, setBulkConfirm] = useState(false);

    useEffect(() => {
      setTableData(rows);
    }, [rows]);

    const primaryKey = useMemo(() => getPrimaryKey(columns), [columns]);
    const secondaryKey = useMemo(() => getSecondaryKey(columns, primaryKey), [columns, primaryKey]);
    const hasStatus = columns.some((col) => col.key === 'status');
    const activeFilterKeys = useMemo(
      () => getFilterKeys(columns, filterKeys),
      [columns, filterKeys]
    );
    const toolbarFilterKey = activeFilterKeys[0];

    const goCreate = useCallback(() => {
      if (createHref) router.push(createHref);
    }, [createHref, router]);

    useImperativeHandle(ref, () => ({ openCreate: goCreate }), [goCreate]);

    const goEdit = useCallback(
      (row) => {
        if (getEditHref) router.push(getEditHref(row));
      },
      [getEditHref, router]
    );

    const statusOptions = useMemo(() => {
      if (!hasStatus) return [];
      const values = Array.from(
        new Set(tableData.map((row) => String(row.status ?? '')).filter(Boolean))
      );
      return [{ value: 'all', label: 'All' }, ...values.map((value) => ({ value, label: value }))];
    }, [hasStatus, tableData]);

    const filterOptions = useMemo(() => {
      if (!toolbarFilterKey) return [];
      return Array.from(
        new Set(tableData.map((row) => String(row[toolbarFilterKey] ?? '')).filter(Boolean))
      ).sort();
    }, [tableData, toolbarFilterKey]);

    const dataFiltered = useMemo(() => {
      const q = search.trim().toLowerCase();

      const filtered = tableData.filter((row) => {
        if (hasStatus && statusTab !== 'all' && String(row.status) !== statusTab) return false;

        if (toolbarFilterKey) {
          const selected = filters[toolbarFilterKey];
          if (selected && selected !== 'all' && String(row[toolbarFilterKey] ?? '') !== selected) {
            return false;
          }
        }

        if (!q) return true;

        return columns.some((col) =>
          String(row[col.key] ?? '')
            .toLowerCase()
            .includes(q)
        );
      });

      const comparator = getComparator(table.order, table.orderBy);
      return filtered.sort(comparator);
    }, [
      columns,
      filters,
      hasStatus,
      search,
      statusTab,
      table.order,
      table.orderBy,
      tableData,
      toolbarFilterKey,
    ]);

    const dataInPage = useMemo(
      () =>
        dataFiltered.slice(
          table.page * table.rowsPerPage,
          table.page * table.rowsPerPage + table.rowsPerPage
        ),
      [dataFiltered, table.page, table.rowsPerPage]
    );

    const notFound = !dataFiltered.length;

    const headLabel = useMemo(
      () => [
        ...columns
          .filter((col) => !(secondaryKey && col.key === secondaryKey))
          .map((col) => ({
            id: col.key,
            label: col.label,
            width: col.key === primaryKey ? 240 : undefined,
          })),
        { id: '', width: 88 },
      ],
      [columns, primaryKey, secondaryKey]
    );

    const handleDeleteRow = useCallback(
      (id) => {
        if (onDeleteRow) onDeleteRow(id);
        else setTableData((prev) => prev.filter((row) => row.id !== id));
        toast.success('Delete success!');
        table.onUpdatePageDeleteRow(dataInPage.length);
      },
      [dataInPage.length, onDeleteRow, table]
    );

    const handleDeleteRows = useCallback(() => {
      if (onDeleteRow) table.selected.forEach((id) => onDeleteRow(id));
      else setTableData((prev) => prev.filter((row) => !table.selected.includes(row.id)));
      toast.success('Delete success!');
      table.onUpdatePageDeleteRows({
        totalRowsInPage: dataInPage.length,
        totalRowsFiltered: dataFiltered.length,
      });
      setBulkConfirm(false);
    }, [dataFiltered.length, dataInPage.length, onDeleteRow, table]);

    return (
      <Card sx={sx}>
        {(title || showCreateButton) && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2.5, pb: title ? 2 : 0 }}
          >
            {title ? <Typography variant="h6">{title}</Typography> : <span />}
            {showCreateButton && createHref && (
              <Button
                component={RouterLink}
                href={createHref}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                {createLabel}
              </Button>
            )}
          </Stack>
        )}

        {hasStatus && (
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
            {statusOptions.map((tab) => (
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
                    color={statusColor(tab.value === 'all' ? 'default' : tab.value)}
                  >
                    {tab.value === 'all'
                      ? tableData.length
                      : tableData.filter((row) => String(row.status) === tab.value).length}
                  </Label>
                }
              />
            ))}
          </Tabs>
        )}

        <Stack
          spacing={2}
          alignItems={{ xs: 'flex-end', md: 'center' }}
          direction={{ xs: 'column', md: 'row' }}
          sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
        >
          {toolbarFilterKey && (
            <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
              <InputLabel>
                {columns.find((col) => col.key === toolbarFilterKey)?.label || toolbarFilterKey}
              </InputLabel>
              <Select
                value={filters[toolbarFilterKey] || 'all'}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, [toolbarFilterKey]: e.target.value }));
                  table.onResetPage();
                }}
                input={
                  <OutlinedInput
                    label={
                      columns.find((col) => col.key === toolbarFilterKey)?.label || toolbarFilterKey
                    }
                  />
                }
              >
                <MenuItem value="all">All</MenuItem>
                {filterOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
            <TextField
              fullWidth
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                table.onResetPage();
              }}
              placeholder={searchPlaceholder}
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
                <IconButton color="primary" onClick={() => setBulkConfirm(true)}>
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
                headLabel={headLabel}
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
                {dataInPage.map((row) => {
                  const selected = table.selected.includes(row.id);

                  return (
                    <TableRow key={row.id} hover selected={selected} aria-checked={selected}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={selected} onClick={() => table.onSelectRow(row.id)} />
                      </TableCell>

                      {columns.map((col) => {
                        const value = formatCell(row[col.key]);

                        if (col.key === primaryKey) {
                          return (
                            <TableCell key={col.key}>
                              <Stack
                                sx={{
                                  typography: 'body2',
                                  flex: '1 1 auto',
                                  alignItems: 'flex-start',
                                }}
                              >
                                <Box
                                  component="span"
                                  onClick={() => goEdit(row)}
                                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                                >
                                  {value}
                                </Box>
                                {secondaryKey && (
                                  <Box component="span" sx={{ color: 'text.disabled' }}>
                                    {formatCell(row[secondaryKey])}
                                  </Box>
                                )}
                              </Stack>
                            </TableCell>
                          );
                        }

                        if (secondaryKey && col.key === secondaryKey) return null;

                        return (
                          <TableCell key={col.key} sx={{ whiteSpace: 'nowrap' }}>
                            {isBadgeColumn(col.key) ? (
                              <Label variant="soft" color={statusColor(value)}>
                                {String(value)}
                              </Label>
                            ) : (
                              value
                            )}
                          </TableCell>
                        );
                      })}

                      <TableCell align="right">
                        <RowActions
                          onEdit={() => goEdit(row)}
                          onDelete={() => handleDeleteRow(row.id)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

                <TableEmptyRows
                  height={table.dense ? 56 : 56 + 20}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
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

        <ConfirmDialog
          open={bulkConfirm}
          onClose={() => setBulkConfirm(false)}
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
      </Card>
    );
  }
);

HealthlineCrudTable.displayName = 'HealthlineCrudTable';
