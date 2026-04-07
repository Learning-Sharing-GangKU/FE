import { useQuery } from '@tanstack/react-query';
import { fetchUserGatherings } from '@/api/gathering';

export function useUserGatherings(
  role: 'host' | 'guest',
  params?: { page?: number; size?: number; sort?: string }
) {
  const { data, isLoading } = useQuery({
    queryKey: ['userGatherings', role, params],
    queryFn: () => fetchUserGatherings(role, params),
  });

  return {
    gatherings: data?.data ?? [],
    meta: data?.meta,
    isLoading,
  };
}
