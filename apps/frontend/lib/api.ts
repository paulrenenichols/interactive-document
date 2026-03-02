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

/** Upload a file (e.g. CSV) to a path. Do not set Content-Type so the browser sets multipart boundary. */
export async function uploadWithAuth(
  path: string,
  file: File,
  options?: { deckId?: string; name?: string }
): Promise<Response> {
  const url = new URL(`${apiUrl()}${path.startsWith('/') ? path : `/${path}`}`);
  if (options?.deckId) url.searchParams.set('deckId', options.deckId);
  if (options?.name) url.searchParams.set('name', options.name);
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const body = new FormData();
  body.append('file', file);
  const res = await fetch(url.toString(), { method: 'POST', headers, body });
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
