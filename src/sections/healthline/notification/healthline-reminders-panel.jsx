'use client';

import { useEffect, useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LoadingButton from '@mui/lab/LoadingButton';

import axios, { endpoints } from 'src/utils/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

/** value: 1 = Sunday … 7 = Saturday (same as the APK / expo-notifications) */
const WEEKDAYS = [
  { value: 1, label: 'Sunday', short: 'Sun' },
  { value: 2, label: 'Monday', short: 'Mon' },
  { value: 3, label: 'Tuesday', short: 'Tue' },
  { value: 4, label: 'Wednesday', short: 'Wed' },
  { value: 5, label: 'Thursday', short: 'Thu' },
  { value: 6, label: 'Friday', short: 'Fri' },
  { value: 7, label: 'Saturday', short: 'Sat' },
];
const ALL_DAYS = WEEKDAYS.map((d) => d.value);

const TABLE_HEAD = [
  { id: 'label', label: 'Reminder' },
  { id: 'schedule', label: 'When' },
  { id: 'enabled', label: 'Show in app', width: 130 },
  { id: 'defaultOn', label: 'ON by default', width: 140 },
  { id: '', width: 60 },
];

function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function daysText(weekdays = []) {
  if (!weekdays.length || weekdays.length === ALL_DAYS.length) return 'Every day';
  const picked = WEEKDAYS.filter((d) => weekdays.includes(d.value));
  return picked.length === 1 ? picked[0].label : picked.map((d) => d.short).join(', ');
}

function scheduleText(row) {
  const times = row.times.map(formatTime).join(', ');
  return `${daysText(row.weekdays)} · ${times}`;
}

// ----------------------------------------------------------------------

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1 … 12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0 … 59

/** "13:30" → { hour: 1, minute: 30, period: 'PM' } */
function toParts(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return { hour: h % 12 || 12, minute: m, period: h >= 12 ? 'PM' : 'AM' };
}

/** { hour: 1, minute: 30, period: 'PM' } → "13:30" (what the API and APK store) */
function toHHmm({ hour, minute, period }) {
  const h24 = (hour % 12) + (period === 'PM' ? 12 : 0);
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function TimeRow({ value, onChange, onRemove, canRemove }) {
  const set = (field) => (event) => onChange({ ...value, [field]: event.target.value });

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <TextField select label="Hour" value={value.hour} onChange={set('hour')} sx={{ width: 96 }}>
        {HOURS.map((h) => (
          <MenuItem key={h} value={h}>
            {h}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Minute"
        value={value.minute}
        onChange={set('minute')}
        sx={{ width: 96 }}
        SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 280 } } } }}
      >
        {MINUTES.map((m) => (
          <MenuItem key={m} value={m}>
            {String(m).padStart(2, '0')}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="AM / PM"
        value={value.period}
        onChange={set('period')}
        sx={{ width: 104 }}
      >
        <MenuItem value="AM">AM</MenuItem>
        <MenuItem value="PM">PM</MenuItem>
      </TextField>
      <Tooltip title={canRemove ? 'Remove time' : 'At least one time is needed'}>
        <span>
          <IconButton color="error" onClick={onRemove} disabled={!canRemove}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function ReminderEditDialog({ reminder, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reminder) {
      setForm({
        title: reminder.title,
        body: reminder.body,
        times: (reminder.times.length ? reminder.times : ['08:00']).map(toParts),
        weekdays: reminder.weekdays?.length ? reminder.weekdays : ALL_DAYS,
      });
    }
  }, [reminder]);

  if (!reminder || !form) return null;

  const set = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const everyDay = form.weekdays.length === ALL_DAYS.length;

  const toggleEveryDay = (checked) =>
    setForm((prev) => ({ ...prev, weekdays: checked ? ALL_DAYS : [] }));

  const toggleDay = (value) =>
    setForm((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(value)
        ? prev.weekdays.filter((d) => d !== value)
        : [...prev.weekdays, value].sort(),
    }));

  const setTime = (idx, next) =>
    setForm((prev) => ({ ...prev, times: prev.times.map((t, i) => (i === idx ? next : t)) }));

  const removeTime = (idx) =>
    setForm((prev) => ({ ...prev, times: prev.times.filter((_, i) => i !== idx) }));

  const addTime = () =>
    setForm((prev) => ({ ...prev, times: [...prev.times, { hour: 12, minute: 0, period: 'PM' }] }));

  const submit = async () => {
    const times = form.times.map(toHHmm);
    if (!times.length) {
      toast.error('Add at least one time');
      return;
    }
    if (new Set(times).size !== times.length) {
      toast.error('The same time is added twice');
      return;
    }
    if (!form.weekdays.length) {
      toast.error('Select at least one day');
      return;
    }
    setSaving(true);
    await onSave(reminder, {
      title: form.title,
      body: form.body,
      times,
      weekdays: form.weekdays,
    });
    setSaving(false);
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={() => !saving && onClose()}>
      <DialogTitle>Edit {reminder.label}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Notification title"
            value={form.title}
            onChange={set('title')}
            inputProps={{ maxLength: 80 }}
          />
          <TextField
            label="Message"
            value={form.body}
            onChange={set('body')}
            multiline
            rows={2}
            inputProps={{ maxLength: 200 }}
          />
          <Stack spacing={1.5}>
            <FormLabel sx={{ typography: 'subtitle2' }}>Times</FormLabel>
            {form.times.map((time, idx) => (
              <TimeRow
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                value={time}
                onChange={(next) => setTime(idx, next)}
                onRemove={() => removeTime(idx)}
                canRemove={form.times.length > 1}
              />
            ))}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                size="small"
                variant="soft"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={addTime}
              >
                Add time
              </Button>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                One notification per time
              </Typography>
            </Stack>
          </Stack>
          <FormControl component="fieldset" error={!form.weekdays.length}>
            <FormLabel component="legend" sx={{ typography: 'subtitle2', mb: 0.5 }}>
              Days
            </FormLabel>
            <FormControlLabel
              label="Every day"
              control={
                <Checkbox
                  checked={everyDay}
                  indeterminate={!everyDay && form.weekdays.length > 0}
                  onChange={(e) => toggleEveryDay(e.target.checked)}
                />
              }
            />
            <FormGroup row sx={{ pl: 1 }}>
              {WEEKDAYS.map((day) => (
                <FormControlLabel
                  key={day.value}
                  label={day.label}
                  sx={{ minWidth: 140 }}
                  control={
                    <Checkbox
                      checked={form.weekdays.includes(day.value)}
                      onChange={() => toggleDay(day.value)}
                    />
                  }
                />
              ))}
            </FormGroup>
            <FormHelperText>
              {form.weekdays.length ? daysText(form.weekdays) : 'Select at least one day'}
            </FormHelperText>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <LoadingButton variant="contained" loading={saving} onClick={submit}>
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

export function HealthlineRemindersPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${endpoints.reminders.list}?all=1`);
      setRows(res.data?.reminders || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load reminders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (row, changes) => {
    try {
      const res = await axios.put(endpoints.reminders.details(row.key), { ...row, ...changes });
      const next = res.data.reminder;
      setRows((prev) => prev.map((r) => (r.key === next.key ? next : r)));
      toast.success(`${next.label} saved`);
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save reminder');
    }
  };

  return (
    <>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        These reminders are scheduled on each phone (local time). <b>Show in app</b> off hides the
        reminder for everyone. <b>ON by default</b> applies to users who have not changed that
        toggle themselves. Phones pick up changes the next time the app is opened.
      </Typography>

      <Card>
        <Scrollbar>
          <Table sx={{ minWidth: 800 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={TABLE_HEAD.length} sx={{ p: 0, border: 'none' }}>
                    <LoadingScreen sx={{ py: 10, minHeight: 280 }} />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.key} hover sx={{ opacity: row.enabled ? 1 : 0.55 }}>
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography variant="subtitle2">{row.label}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {row.title} — {row.body}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{scheduleText(row)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={row.enabled}
                        onChange={(e) => save(row, { enabled: e.target.checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={row.defaultOn}
                        disabled={!row.enabled}
                        onChange={(e) => save(row, { defaultOn: e.target.checked })}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit text and times">
                        <IconButton onClick={() => setEditing(row)}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>

      <ReminderEditDialog reminder={editing} onClose={() => setEditing(null)} onSave={save} />
    </>
  );
}
