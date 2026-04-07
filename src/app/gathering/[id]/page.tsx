// ✅ 서버 컴포넌트 — 토큰 필요 없는 공개 API이므로 서버에서 직접 fetch 가능
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { fetchGatheringDetailSSR } from '@/api/serverFetch';
import { makeServerQueryClient } from '@/lib/serverQueryClient';
import GatheringDetailClient from './GatheringDetailClient';

export default async function GatheringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: gatheringId } = await params;
  const queryClient: QueryClient = makeServerQueryClient();

  const detail = await fetchGatheringDetailSSR(gatheringId);
  if (detail) {
    queryClient.setQueryData(['gathering', gatheringId], detail);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GatheringDetailClient />
    </HydrationBoundary>
  );
}
