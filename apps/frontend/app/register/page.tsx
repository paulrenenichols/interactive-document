'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/api';
import { setToken } from '@/lib/auth';
import type { RegisterScreenState } from '../../components/auth/RegisterScreen';
import { RegisterScreen } from '../../components/auth/RegisterScreen';

function RegisterScreenContainer() {
  const router = useRouter();
  const [state, setState] = useState<RegisterScreenState>({
    email: '',
    password: '',
    confirmPassword: '',
    loading: false,
    error: undefined,
  });

  function update(partial: Partial<RegisterScreenState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  async function handleSubmit() {
    if (state.password.length < 8) {
      update({ error: 'Password must be at least 8 characters' });
      return;
    }
    if (state.password !== state.confirmPassword) {
      update({ error: 'Passwords do not match' });
      return;
    }

    update({ error: undefined, loading: true });
    try {
      const res = await fetch(`${apiUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email.trim(),
          password: state.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        update({ error: data.error ?? 'Registration failed' });
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
      update({ error: 'Network error' });
    } finally {
      update({ loading: false });
    }
  }

  return (
    <RegisterScreen
      state={state}
      callbacks={{
        onChangeEmail: (email) => update({ email }),
        onChangePassword: (password) => update({ password }),
        onChangeConfirmPassword: (confirmPassword) => update({ confirmPassword }),
        onSubmit: handleSubmit,
      }}
    />
  );
}

export default function RegisterPage() {
  return <RegisterScreenContainer />;
}
