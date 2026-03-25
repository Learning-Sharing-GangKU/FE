import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/** 인증 가드 — 비로그인 시 로그인 페이지로 리다이렉트 */
export function useAuthGuard() {
  const router = useRouter();
  const { isLoggedIn, myUserId } = useAuth();

  useEffect(() => {
    if (isLoggedIn === false) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  return { isLoggedIn, myUserId };
}
