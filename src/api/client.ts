import { getAccessToken } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function apiFetch(input: string, init: RequestInit = {}) {
  let token: string | null = null;
  try {
    const t = getAccessToken();
    if (typeof t === 'string' && t.trim() !== '') {
      token = t.trim();
    }
  } catch {
    token = null;
  }
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${input}`, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    const message = `Request failed: ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}
