// ✅ 서버 컴포넌트 — 쿠키 토큰으로 프로필 데이터 미리 fetch
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { fetchUserProfileSSR } from '@/api/serverFetch';
import { makeServerQueryClient } from '@/lib/serverQueryClient';
import ProfileClient from './ProfileClient';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const queryClient: QueryClient = makeServerQueryClient();

  const profileData = await fetchUserProfileSSR(userId);
  if (profileData) {
    queryClient.setQueryData(['profile', userId], profileData);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileClient />
    </HydrationBoundary>
  );
}
