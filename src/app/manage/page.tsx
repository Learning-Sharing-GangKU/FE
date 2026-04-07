// ✅ 서버 컴포넌트 — 쿠키에서 토큰 읽어 인증 API 호출 (로그인한 유저의 모임 목록)
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { fetchUserGatheringsSSR } from '@/api/serverFetch';
import { makeServerQueryClient } from '@/lib/serverQueryClient';
import ManageClient from './ManageClient';

export default async function ManagePage() {
  const queryClient: QueryClient = makeServerQueryClient();

  // 내가 만든 모임(host) 미리 fetch — 기본 탭이 '내가 만든 모임'이므로
  const hostData = await fetchUserGatheringsSSR('host');
  if (hostData) {
    queryClient.setQueryData(['userGatherings', 'host', undefined], hostData);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ManageClient />
    </HydrationBoundary>
  );
}
