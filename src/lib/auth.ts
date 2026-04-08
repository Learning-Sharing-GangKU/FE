// ✅ src/lib/auth.ts
import axios from 'axios' 

export const ACCESS_TOKEN_KEY = 'accessToken';
export const TOKEN_ISSUED_AT_KEY = 'tokenIssuedAt';

export function setAccessToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(TOKEN_ISSUED_AT_KEY, Date.now().toString());
    document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax;`;
    document.cookie = `isAuthenticated=true; path=/; max-age=86400; SameSite=Lax;`;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getTokenIssuedAt(): number | null {
  const issuedAt = localStorage.getItem(TOKEN_ISSUED_AT_KEY);
  return issuedAt ? parseInt(issuedAt, 10) : null;
}

export function removeAccessToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_ISSUED_AT_KEY);
    document.cookie = `accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;`;
    document.cookie = `isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;`;
  }
}

export function isTokenExpiredOrNearExpiry(minutesBeforeExpiry = 1): boolean {
  const issuedAt = getTokenIssuedAt();
  if (!issuedAt) return true;
  
  const now = Date.now();
  const elapsedMinutes = (now - issuedAt) / (1000 * 60);
  // 15분 - 1분 = 14분 경과 시 만료 임박으로 간주
  return elapsedMinutes >= (15 - minutesBeforeExpiry);
}

export async function logoutUser() {
  await axios.post('/api/v1/auth/logout', {}, { withCredentials: true });
}