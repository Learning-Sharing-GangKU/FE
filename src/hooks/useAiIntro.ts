import { useMutation } from '@tanstack/react-query';
import { generateGatheringIntro } from '@/api/gathering';

/** AI 모임 설명 자동생성 */
export function useAiIntro() {
  return useMutation({
    mutationFn: (data: {
      title: string;
      category: string;
      capacity: number;
      date: string;
      location: string;
      keywords: string[];
    }) => generateGatheringIntro(data),
  });
}
