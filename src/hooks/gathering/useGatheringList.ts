import { useQuery } from '@tanstack/react-query';
import { getGatherings, getHome } from '@/api/gathering';

/** 홈 화면 — 추천/최신/인기 모임 */
export function useHome() {
  return useQuery({
    queryKey: ['home'],
    queryFn: getHome,
  });
}

/** 모임 리스트 — 카테고리 페이지 */
export function useGatheringList(params?: {
  category?: string;
  page?: number;
  size?: number;
  sort?: 'latest' | 'popular' | 'recommended';
}) {
  return useQuery({
    queryKey: ['gatherings', params],
    queryFn: () => getGatherings(params),
  });
}
