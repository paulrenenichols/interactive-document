'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <main style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: 400, margin: '0 auto' }}>
      <h1>Create account</h1>
      <form onSubmit={handleSubmit}>
        {error && (
          <p style={{ color: 'crimson', marginBottom: '1rem' }}>{error}</p>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: 4 }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: 4 }}>
            Password (min 8 characters)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <a href="/login">Already have an account? Log in</a>
      </p>
    </main>
  );
}
