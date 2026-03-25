import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/auth';
import type { LoginRequest } from '@/types/auth';

/** 로그인 */
export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
  });
}
