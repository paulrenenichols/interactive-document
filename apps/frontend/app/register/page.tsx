'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { apiUrl } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Registration failed');
        return;
      }
      if (data.token) {
        setToken(data.token);
        router.push('/');
      } else {
        router.push('/login');
      }
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
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Typography variant="h5" component="h1">
              Create account
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
              label="Password (min 8 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              fullWidth
            />
            <Button type="submit" disabled={loading} variant="filled">
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
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
