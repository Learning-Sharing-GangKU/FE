'use client';

import React, { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAccessToken } from '@/lib/auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,      // 1분간 fresh — 페이지 이동 시 캐시 즉시 표시
            gcTime: 5 * 60 * 1000,     // 5분간 메모리 보유
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // 이미 로그인된 유저가 재방문 시 쿠키 동기화 (1회)
  useEffect(() => {
    const token = getAccessToken();
    if (token && !document.cookie.includes('accessToken=')) {
      document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}