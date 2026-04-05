import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { deleteUser } from '@/api/user';
import { useAuth } from '@/contexts/AuthContext';

export function useWithdraw(userId: string) {
  const router = useRouter();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: () => {
      logout();
      router.push('/home');
    },
  });
}
