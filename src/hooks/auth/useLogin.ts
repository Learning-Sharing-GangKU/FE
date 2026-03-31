import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginRequest } from '@/types/auth';

/** 로그인 */
export function useLogin() {
  const { login: authLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (data) => {
      authLogin(data.accessToken);
      const from = searchParams.get('from');
      router.push(from ?? '/home');
    },
  });
}
