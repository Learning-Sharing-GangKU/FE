// ✅ 서버 컴포넌트 — 초기 인기순 목록을 서버에서 미리 가져와 전달
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { fetchGatheringsSSR } from '@/api/serverFetch';
import { makeServerQueryClient } from '@/lib/serverQueryClient';
import CategoryClient from './CategoryClient';

export default async function CategoryPage() {
  const queryClient: QueryClient = makeServerQueryClient();

  const initialData = await fetchGatheringsSSR({ page: 1, size: 12, sort: 'popular' });
  if (initialData) {
    // 초기 필터(카테고리 없음, 인기순)에 해당하는 queryKey에 데이터 주입
    queryClient.setQueryData(
      ['gatherings', { category: undefined, page: 1, size: 12, sort: 'popular' }],
      initialData
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryClient />
    </HydrationBoundary>
  );
}
