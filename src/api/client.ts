import { getAccessToken } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

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
    let errorMessage = `Request failed: ${res.status}`;
    let errorCode: string | undefined;

    try {
      const errorData = await res.json();
      if (errorData.message) errorMessage = errorData.message;
      if (errorData.code) errorCode = errorData.code;
    } catch {
      // JSON 파싱 실패 시 기본 응답 문자열 사용 시도
      try {
        const textData = await res.text();
        if (textData) errorMessage = textData;
      } catch {
        // 무시
      }
    }

    throw new ApiError(res.status, errorMessage, errorCode);
  }
  if (res.status === 204) return null;
  return res.json();
}
