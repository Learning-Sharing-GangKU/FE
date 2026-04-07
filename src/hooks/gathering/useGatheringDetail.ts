import { useQuery } from '@tanstack/react-query';
import { getGatheringDetail } from '@/api/gathering';

export function useGatheringDetail(gatheringId: string) {
  return useQuery({
    queryKey: ['gathering', gatheringId],
    queryFn: () => getGatheringDetail(gatheringId),
    enabled: !!gatheringId,
  });
}
