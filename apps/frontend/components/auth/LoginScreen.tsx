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
} from '@/lib/material-ui-shim';

export type LoginScreenState = {
  email: string;
  password: string;
  loading: boolean;
  error?: string;
};

export type LoginScreenCallbacks = {
  onChangeEmail?: (value: string) => void;
  onChangePassword?: (value: string) => void;
  onSubmit?: () => void;
  onForgotPassword?: () => void;
  onGoogleSignIn?: () => void;
};

export type LoginScreenProps = {
  state: LoginScreenState;
  callbacks?: LoginScreenCallbacks;
  footerSlot?: ReactNode;
};

export function LoginScreen({ state, callbacks, footerSlot }: LoginScreenProps) {
  const { email, password, loading, error } = state;

  return (
    <Box
      component="main"
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
        elevation={1}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 3,
        }}
      >
        <Stack
          component="form"
          spacing={2}
          onSubmit={(e) => {
            e.preventDefault();
            callbacks?.onSubmit?.();
          }}
        >
          <Typography variant="h5" component="h1">
            Log in
          </Typography>
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
            label="Password"
            type="password"
            value={password}
            onChange={(e) => callbacks?.onChangePassword?.(e.target.value)}
            required
            autoComplete="current-password"
            fullWidth
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              type="button"
              variant="text"
              size="small"
              onClick={() => callbacks?.onForgotPassword?.()}
            >
              Forgot password?
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="filled"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>
          <Button
            type="button"
            variant="outlined"
            disabled={loading}
            onClick={() => callbacks?.onGoogleSignIn?.()}
          >
            Continue with Google
          </Button>
          <Typography variant="body2">
            <NextLink
              href="/register"
              className="cursor-pointer text-accent-primary no-underline hover:underline transition-colors duration-[150ms] hover:text-accent-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 dark:text-accent-primary dark:hover:text-accent-primary-hover"
            >
              Create an account
            </NextLink>
          </Typography>
          {footerSlot}
        </Stack>
      </Paper>
    </Box>
  );
}

