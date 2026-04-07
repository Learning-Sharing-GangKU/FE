// ✅ 서버 컴포넌트 - "use client" 없음!
// 서버에서 데이터를 미리 가져와 HydrationBoundary로 클라이언트에 전달
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { fetchHomeSSR } from '@/api/serverFetch';
import { makeServerQueryClient } from '@/lib/serverQueryClient';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const queryClient: QueryClient = makeServerQueryClient();

  // 서버에서 직접 API 호출 → 클라이언트가 받는 HTML에 데이터가 이미 포함됨
  const homeData = await fetchHomeSSR();

  if (homeData) {
    queryClient.setQueryData(['home'], homeData);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* HomeClient는 queryKey: ['home'] 데이터를 이미 갖고 있어 즉시 렌더링 */}
      <HomeClient />
    </HydrationBoundary>
  );
}
