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
    let errorCode: string | undefined;
    let errorMessage = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      errorCode = body?.error?.code;
      if (body?.error?.message) errorMessage = body.error.message;
    } catch {}
    const err = new Error(errorMessage) as any;
    err.code = errorCode;
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}
