import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGathering } from '@/api/gathering';
import type { CreateGatheringRequest } from '@/types/gathering';

/** 모임 생성 */
export function useCreateGathering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGatheringRequest) => createGathering(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gatherings'] });
    },
  });
}
