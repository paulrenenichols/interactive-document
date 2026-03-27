import type { ReactNode } from 'react';
import NextLink from 'next/link';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '../../lib/material-ui-shim';

export type RegisterScreenState = {
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error?: string;
};

export type RegisterScreenCallbacks = {
  onChangeEmail?: (value: string) => void;
  onChangePassword?: (value: string) => void;
  onChangeConfirmPassword?: (value: string) => void;
  onSubmit?: () => void;
};

export type RegisterScreenProps = {
  state: RegisterScreenState;
  callbacks?: RegisterScreenCallbacks;
  footerSlot?: ReactNode;
};

export function RegisterScreen({ state, callbacks, footerSlot }: RegisterScreenProps) {
  const { email, password, confirmPassword, loading, error } = state;

  return (
    <Box
      component="main"
      className="bg-bg-secondary"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Paper
        variant="outlined"
        className="w-full max-w-[420px] p-6 shadow-lg"
      >
        <Stack
          component="form"
          spacing={2}
          onSubmit={(e) => {
            e.preventDefault();
            callbacks?.onSubmit?.();
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h5" component="h1">
              Create account
            </Typography>
            <Typography variant="body2" className="text-text-secondary">
              Get started with interactive data presentations
            </Typography>
          </Stack>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
          <TextField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => callbacks?.onChangeEmail?.(e.target.value)}
            required
            autoComplete="email"
            fullWidth
          />
          <TextField
            id="password"
            label="Password (min 8 characters)"
            type="password"
            value={password}
            onChange={(e) => callbacks?.onChangePassword?.(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            fullWidth
          />
          <TextField
            id="confirm-password"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => callbacks?.onChangeConfirmPassword?.(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            fullWidth
          />
          <Button
            type="submit"
            disabled={loading}
            variant="filled"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
          <Typography variant="body2">
            <NextLink
              href="/login"
              className="cursor-pointer text-accent-primary no-underline hover:underline transition-colors duration-[150ms] hover:text-accent-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 dark:text-accent-primary dark:hover:text-accent-primary-hover"
            >
              Already have an account? Log in
            </NextLink>
          </Typography>
          {footerSlot}
        </Stack>
      </Paper>
    </Box>
  );
}

