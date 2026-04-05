import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleReviewPublic } from '@/api/user';
import { useState, useEffect } from 'react';

export function useReviewToggle(userId: string, initialValue?: boolean) {
  const queryClient = useQueryClient();
  const [isPublic, setIsPublic] = useState<boolean>(false);

  // 🔥 profile 로딩 후 동기화
  useEffect(() => {
    if (typeof initialValue === 'boolean') {
      setIsPublic(initialValue);
    }
  }, [initialValue]);

  const mutation = useMutation({
    mutationFn: (reviewPublic: boolean) =>
      toggleReviewPublic(userId, reviewPublic),

    onSuccess: (data, reviewPublic) => {
      const saved = data?.reviewPublic ?? reviewPublic;
      setIsPublic(saved);
      queryClient.setQueryData(['profile', userId], (old: any) =>
        old ? { ...old, reviewPublic: saved } : old
      );
    },

    onError: () => {
      setIsPublic((prev) => !prev);
    },
  });

  const toggle = (nextValue: boolean) => {
    setIsPublic(nextValue);
    mutation.mutate(nextValue);
  };

  return {
    isPublic,
    toggle,
    isLoading: mutation.isPending,
  };
}