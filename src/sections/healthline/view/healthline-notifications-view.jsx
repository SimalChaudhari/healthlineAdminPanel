'use client';

import { useEffect, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
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
import { DashboardContent } from 'src/layouts/dashboard';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { HealthlineTableRowActions } from '../healthline-table-row-actions';
import { HealthlineRemindersPanel } from '../notification/healthline-reminders-panel';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'title', label: 'Notification' },
  { id: 'audience', label: 'Audience' },
  { id: 'status', label: 'Status' },
  { id: 'sentCount', label: 'Delivered' },
  { id: 'date', label: 'Date' },
  { id: '', width: 140, align: 'right' },
];

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-SG', { dateStyle: 'medium', timeStyle: 'short' });
}

// ----------------------------------------------------------------------

export function HealthlineNotificationsView() {
  const router = useRouter();
  const table = useTable();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendId, setSendId] = useState(null);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState('push');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints.notifications.list);
      setRows(res.data?.notifications || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const editHref = (id) => `${paths.dashboard.notifications}/${id}/edit`;

  const onDelete = async (id) => {
    try {
      await axios.delete(endpoints.notifications.details(id));
      toast.success('Notification deleted');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete notification');
    }
  };

  const onSend = async () => {
    if (!sendId) return;
    try {
      setSending(true);
      const res = await axios.post(endpoints.notifications.send(sendId));
      const result = res.data?.result;
      toast.success(
        result?.devices
          ? `Sent to ${result.sent} of ${result.devices} devices`
          : 'No devices registered for this audience yet'
      );
      setSendId(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send notification');
    } finally {
      setSending(false);
    }
  };

  const dataInPage = rows.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Notifications"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Notifications' }]}
        action={
          tab === 'push' && (
            <Button
              component={RouterLink}
              href={`${paths.dashboard.notifications}/new`}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New notification
            </Button>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3, mt: -2 }}>
        <Tab value="push" label="Push campaigns" />
        <Tab value="reminders" label="App reminders" />
      </Tabs>

      {tab === 'reminders' && <HealthlineRemindersPanel />}

      {tab === 'push' && (
        <>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            One-off push messages sent from here to Healthline app users.
          </Typography>

          <Card>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={TABLE_HEAD.length} sx={{ p: 0, border: 'none' }}>
                        <LoadingScreen sx={{ py: 10, minHeight: 280 }} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataInPage.map((row) => {
                      const isDraft = row.status === 'Draft';
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell>
                            <Stack spacing={0.25}>
                              <Box
                                component="span"
                                onClick={() => isDraft && router.push(editHref(row.id))}
                                sx={{ fontWeight: 600, cursor: isDraft ? 'pointer' : 'default' }}
                              >
                                {row.title}
                              </Box>
                              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                {row.body}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {row.audience === 'All' ? 'All users' : `${row.audience} plan`}
                          </TableCell>
                          <TableCell>
                            <Label variant="soft" color={isDraft ? 'default' : 'success'}>
                              {row.status}
                            </Label>
                          </TableCell>
                          <TableCell>
                            {isDraft
                              ? '—'
                              : `${row.sentCount}${row.failedCount ? ` (${row.failedCount} failed)` : ''}`}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {formatDate(isDraft ? row.createdAt : row.sentAt)}
                          </TableCell>
                          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
                            {isDraft && (
                              <Tooltip title="Send now">
                                <IconButton color="primary" onClick={() => setSendId(row.id)}>
                                  <Iconify icon="solar:plain-bold" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <HealthlineTableRowActions
                              onEdit={isDraft ? () => router.push(editHref(row.id)) : undefined}
                              onDelete={() => onDelete(row.id)}
                              confirmContent="Are you sure you want to delete this notification?"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}

                  <TableEmptyRows
                    height={table.dense ? 56 : 76}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, rows.length)}
                  />
                  <TableNoData notFound={!loading && !rows.length} />
                </TableBody>
              </Table>
            </Scrollbar>

            <TablePaginationCustom
              page={table.page}
              dense={table.dense}
              count={rows.length}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onChangeDense={table.onChangeDense}
              onRowsPerPageChange={table.onChangeRowsPerPage}
            />
          </Card>
        </>
      )}

      <ConfirmDialog
        open={!!sendId}
        onClose={() => !sending && setSendId(null)}
        title="Send notification"
        content="This pushes the notification to every matching device right away. It cannot be undone."
        action={
          <Button variant="contained" onClick={onSend} disabled={sending}>
            {sending ? 'Sending…' : 'Send'}
          </Button>
        }
      />
    </DashboardContent>
  );
}
