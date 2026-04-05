import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview } from '@/api/user';
import type { CreateReviewRequest } from '@/types/user';

export function useCreateReview(targetUserId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateReviewRequest) => createReview(targetUserId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
    },
  });

  return {
    ...mutation,
    errorCode: (mutation.error as any)?.code as string | undefined,
    errorMessage: (mutation.error as any)?.message as string | undefined,
  };
}
