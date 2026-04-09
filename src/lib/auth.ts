// ✅ src/lib/auth.ts
import axios from 'axios'

export const ACCESS_TOKEN_KEY = 'accessToken';
export const TOKEN_ISSUED_AT_KEY = 'tokenIssuedAt';

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(TOKEN_ISSUED_AT_KEY, Date.now().toString());
  // SSR 및 미들웨어를 위해 쿠키에 저장 (수명은 백엔드 리프레시 토큰과 동일한 14일로 설정)
  document.cookie = `accessToken=${token}; path=/; max-age=1209600; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getTokenIssuedAt(): number | null {
  const issuedAt = localStorage.getItem(TOKEN_ISSUED_AT_KEY);
  return issuedAt ? parseInt(issuedAt, 10) : null;
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(TOKEN_ISSUED_AT_KEY);
  document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
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