import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview } from '@/api/user';
import type { CreateReviewRequest } from '@/types/user';

export function useCreateReview(targetUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => createReview(targetUserId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
    },
  });
}
