import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signup, sendEmailVerification, confirmEmailVerification } from '@/api/auth';
import type { SignupRequest } from '@/types/auth';

/** 회원가입 */
export function useSignup() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: () => {
      router.push('/login');
    },
  });
}

/** 이메일 인증 발송 */
export function useSendEmailVerification() {
  return useMutation({
    mutationFn: (email: string) => sendEmailVerification(email),
  });
}

/** 이메일 인증 확인 */
export function useConfirmEmailVerification() {
  return useMutation({
    mutationFn: () => confirmEmailVerification(),
  });
}
