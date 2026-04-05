import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/stores/authStore';
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
      const { myUserId } = useAuthStore.getState();
      let from = searchParams.get('from');
      if (from === '/profile' && myUserId) {
        from = `/profile/${myUserId}`;
      }
      router.push(from ?? '/home');
    },
  });
}
