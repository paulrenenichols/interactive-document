'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@/lib/material-ui-shim';
import { apiUrl } from '@/lib/api';
import { setToken } from '@/lib/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }
      if (data.token) {
        setToken(data.token);
      }
      router.push(returnUrl);
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box component="main" sx={{ py: 4 }}>
      <Paper
        elevation={1}
        sx={{
          maxWidth: 400,
          mx: 'auto',
          p: 3,
        }}
      >
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
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
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            fullWidth
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            fullWidth
          />
          <Button type="submit" disabled={loading} variant="filled">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
          <Typography variant="body2">
            <MuiLink component={NextLink} href="/register">
              Create an account
            </MuiLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main style={{ padding: '2rem' }}>Loading…</main>}>
      <LoginForm />
    </Suspense>
  );
}
