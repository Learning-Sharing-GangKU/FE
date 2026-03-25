import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile } from '@/api/user';
import type { UpdateProfilePayload } from '@/types/user';

/** 프로필 수정 */
export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => updateUserProfile(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}
