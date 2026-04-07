import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleReviewPublic } from '@/api/user';

/** 리뷰 공개/비공개 토글 */
export function useReviewToggle(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewPublic: boolean) => toggleReviewPublic(userId, reviewPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}
