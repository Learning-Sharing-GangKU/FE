// ✅ src/lib/auth.ts


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
