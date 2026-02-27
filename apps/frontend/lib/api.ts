import { getToken, clearToken } from './auth';

export function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
}

export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${apiUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    const returnUrl =
      typeof window !== 'undefined'
        ? encodeURIComponent(window.location.pathname + window.location.search)
        : '';
    window.location.href = returnUrl ? `/login?returnUrl=${returnUrl}` : '/login';
    return res;
  }
  return res;
}
