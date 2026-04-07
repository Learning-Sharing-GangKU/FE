'use client';

import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
};

export default function AuthRequiredModal({ isOpen, onClose, redirectTo }: Props) {
  const router = useRouter();

  const handleConfirm = () => {
    onClose();
    const loginUrl = redirectTo ? `/login?from=${encodeURIComponent(redirectTo)}` : '/login';
    router.push(loginUrl);
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="로그인이 필요합니다"
      confirmText="확인"
      cancelText={false}
      description="해당 페이지는 로그인 후 이용할 수 있습니다."
    />
  );
}
