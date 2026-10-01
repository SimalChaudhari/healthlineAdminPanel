'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Form, Field } from 'src/components/hook-form';

const ForgotPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
});

export function ForgotPasswordView() {
  const [sent, setSent] = useState(false);

  const methods = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async () => {
    setSent(true);
  });

  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 5 }}>
        <Typography variant="h5">Forgot password</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Enter your admin email. We will send reset instructions if the account exists.
        </Typography>
      </Stack>

      {sent && (
        <Alert severity="success" sx={{ mb: 3 }}>
          If this email belongs to an admin account, reset instructions will be sent.
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Field.Text name="email" label="Email address" InputLabelProps={{ shrink: true }} />

          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="Sending..."
          >
            Send reset link
          </LoadingButton>

          <Link
            component={RouterLink}
            href={paths.auth.signIn}
            variant="subtitle2"
            sx={{ alignSelf: 'center' }}
          >
            Back to sign in
          </Link>
        </Stack>
      </Form>
    </>
  );
}
