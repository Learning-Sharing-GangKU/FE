import { apiFetch } from '@/api/client';
import type { LoginRequest, LoginResponse, SignupRequest } from '@/types/auth';

/** POST /api/v1/auth/login */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** POST /api/v1/auth/logout */
export async function logout(): Promise<void> {
  await apiFetch('/api/v1/auth/logout', { method: 'POST' });
}

/** POST /api/v1/auth/email/verification — 이메일 인증 발송 */
export async function sendEmailVerification(
  email: string
): Promise<void> {
  return apiFetch('/api/v1/auth/email/verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/** POST /api/v1/auth/email/verification/confirm — 이메일 인증 확인 */
export async function confirmEmailVerification(): Promise<{ verified: boolean; email: string }> {
  return apiFetch('/api/v1/auth/email/verification/confirm', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/** POST /api/v1/auth/reissue — Access 토큰 재발급 */
export async function reissueToken(): Promise<LoginResponse> {
  return apiFetch('/api/v1/auth/reissue', { method: 'POST' });
}

/** POST /api/v1/users — 회원가입 */
export async function signup(data: SignupRequest): Promise<void> {
  await apiFetch('/api/v1/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}