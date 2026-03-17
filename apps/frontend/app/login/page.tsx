'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiUrl } from '@/lib/api';
import { setToken } from '@/lib/auth';
import type { LoginScreenState } from '../../components/auth/LoginScreen';
import { LoginScreen } from '../../components/auth/LoginScreen';

function LoginScreenContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/';

  const [state, setState] = useState<LoginScreenState>({
    email: '',
    password: '',
    rememberMe: false,
    loading: false,
    error: undefined,
  });

  function update(partial: Partial<LoginScreenState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  async function handleSubmit() {
    update({ error: undefined, loading: true });
    try {
      const res = await fetch(`${apiUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email.trim(),
          password: state.password,
          rememberMe: state.rememberMe,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        update({ error: data.error ?? 'Login failed' });
        return;
      }
      if (data.token) {
        setToken(data.token);
      }
      router.push(returnUrl);
      router.refresh();
    } catch {
      update({ error: 'Network error' });
    } finally {
      update({ loading: false });
    }
  }

  return (
    <LoginScreen
      state={state}
      callbacks={{
        onChangeEmail: (email) => update({ email }),
        onChangePassword: (password) => update({ password }),
        onToggleRememberMe: (rememberMe) => update({ rememberMe }),
        onSubmit: handleSubmit,
        onForgotPassword: () => {
          // Placeholder: could route to a dedicated forgot-password page later.
        },
        onGoogleSignIn: () => {
          // Placeholder: hook up to OAuth flow in a later phase if desired.
        },
      }}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main style={{ padding: '2rem' }}>Loading…</main>}>
      <LoginScreenContainer />
    </Suspense>
  );
}
