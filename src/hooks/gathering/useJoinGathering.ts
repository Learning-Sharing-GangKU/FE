import { useMutation, useQueryClient } from '@tanstack/react-query';
import { joinGathering } from '@/api/gathering';

export function useJoinGathering(gatheringId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => joinGathering(gatheringId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
    },
  });
}
