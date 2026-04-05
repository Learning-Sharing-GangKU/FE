import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getUserProfile, getUserReviews } from '@/api/user';
import type { UserProfile } from '@/types/user';

export function useProfile(userId: string | null) {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000,
  });

  const loadMoreReviews = useCallback(async () => {
    if (!profile || !profile.reviewsMeta.hasNext || !userId) return;

    const { reviews: newItems, meta } = await getUserReviews(userId, {
      cursor: profile.reviewsMeta.nextCursor ?? undefined,
    });

    queryClient.setQueryData<UserProfile>(['profile', userId], (prev) =>
      prev
        ? {
            ...prev,
            reviews: [...prev.reviews, ...newItems],
            reviewsMeta: meta,
          }
        : prev
    );
  }, [profile, userId, queryClient]);

  return { profile: profile ?? null, isLoading, error, loadMoreReviews };
}
