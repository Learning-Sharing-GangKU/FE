import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGathering } from '@/api/gathering';
import type { UpdateGatheringRequest } from '@/types/gathering';

/** 모임 수정 */
export function useUpdateGathering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gatheringId, data }: { gatheringId: string; data: UpdateGatheringRequest }) =>
      updateGathering(gatheringId, data),
    onSuccess: (_, { gatheringId }) => {
      queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
      queryClient.invalidateQueries({ queryKey: ['gatherings'] });
    },
  });
}
