'use client';

import { z as zod } from 'zod';
import { useRef, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axios, { endpoints } from 'src/utils/axios';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const NotificationFormSchema = zod.object({
  title: zod
    .string()
    .min(1, { message: 'Title is required!' })
    .max(80, { message: 'Keep the title under 80 characters' }),
  body: zod
    .string()
    .min(1, { message: 'Message is required!' })
    .max(240, { message: 'Keep the message under 240 characters' }),
  audience: zod.string().min(1),
});

// ----------------------------------------------------------------------

export function HealthlineNotificationForm({ currentNotification }) {
  const router = useRouter();
  const isEdit = !!currentNotification;
  const [planCodes, setPlanCodes] = useState([]);
  const sendNowRef = useRef(false);
  const [sendNow, setSendNow] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get(`${endpoints.plans.list}?all=1`);
        if (active) setPlanCodes((res.data?.plans || []).map((p) => p.code));
      } catch {
        // "All users" still works without plans
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const defaultValues = useMemo(
    () => ({
      title: currentNotification?.title || '',
      body: currentNotification?.body || '',
      audience: currentNotification?.audience || 'All',
    }),
    [currentNotification]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NotificationFormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const shouldSend = sendNowRef.current;
    try {
      let result;
      if (isEdit) {
        await axios.put(endpoints.notifications.details(currentNotification.id), data);
        if (shouldSend) {
          const res = await axios.post(endpoints.notifications.send(currentNotification.id));
          result = res.data?.result;
        }
      } else {
        const res = await axios.post(endpoints.notifications.list, { ...data, send: shouldSend });
        result = res.data?.result;
      }

      if (shouldSend && result?.error) {
        toast.error(`Sent to ${result.sent} of ${result.devices} devices — ${result.error}`);
      } else if (shouldSend) {
        toast.success(
          result?.devices
            ? `Sent to ${result.sent} of ${result.devices} devices`
            : 'Saved as sent — no devices registered for this audience yet'
        );
      } else {
        toast.success('Draft saved');
      }
      router.push(paths.dashboard.notifications);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save notification');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Push notification to Healthline app users who allowed notifications and are signed in on
          an installed APK. Keep it short and useful — do not spam.
        </Typography>

        <Box rowGap={3} display="grid">
          <Field.Text name="title" label="Title" placeholder="You've completed 7 days!" />
          <Field.Text
            name="body"
            label="Message"
            multiline
            rows={3}
            placeholder="Keep the streak going — log today's breakfast."
          />
          <Field.Select name="audience" label="Audience" helperText="Users on the chosen plan only">
            <MenuItem value="All">All users</MenuItem>
            {planCodes.map((code) => (
              <MenuItem key={code} value={code}>
                {code} plan
              </MenuItem>
            ))}
          </Field.Select>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.push(paths.dashboard.notifications)}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="outlined"
            loading={isSubmitting && !sendNow}
            disabled={isSubmitting}
            onClick={() => {
              sendNowRef.current = false;
              setSendNow(false);
            }}
          >
            Save draft
          </LoadingButton>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting && sendNow}
            disabled={isSubmitting}
            onClick={() => {
              sendNowRef.current = true;
              setSendNow(true);
            }}
          >
            Send now
          </LoadingButton>
        </Stack>
      </Card>
    </Form>
  );
}
