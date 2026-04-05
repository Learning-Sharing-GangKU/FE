import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signup, sendEmailVerification, confirmEmailVerification } from '@/api/auth';
import type { SignupRequest } from '@/types/auth';

/** 회원가입 */
export function useSignup() {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: () => router.push('/login'),
  });

  return {
    ...mutation,
    errorCode: (mutation.error as any)?.code as string | undefined,
  };
}

/** 이메일 인증 발송 */
export function useSendEmailVerification() {
  const mutation = useMutation({
    mutationFn: (email: string) => sendEmailVerification(email),
  });

  return {
    ...mutation,
    errorCode: (mutation.error as any)?.code as string | undefined,
  };
}

/** 이메일 인증 확인 */
export function useConfirmEmailVerification() {
  return useMutation({
    mutationFn: () => confirmEmailVerification(),
  });
}
