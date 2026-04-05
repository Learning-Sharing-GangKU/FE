import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exitGathering } from '@/api/gathering';

export function useLeaveGathering(gatheringId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => exitGathering(gatheringId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
    },
  });
}
