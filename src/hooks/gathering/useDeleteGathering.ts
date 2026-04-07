import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGathering } from '@/api/gathering';

/** 모임 삭제 */
export function useDeleteGathering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gatheringId: string) => deleteGathering(gatheringId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gatherings'] });
    },
  });
}
