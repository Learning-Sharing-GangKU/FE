import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { useToast } from '@/hooks/useToast';
import { useWithdraw } from './useWithdraw';
import { useReviewSection } from './useReviewSection';

export function useProfilePage(userId: string) {
  const router = useRouter();
  const { myUserId } = useAuth();
  const { profile, isLoading, error, loadMoreReviews } = useProfile(userId);
  const { toast, showToast } = useToast();
  const { mutate: withdrawMutate } = useWithdraw(userId);
  const review = useReviewSection(userId, profile?.reviewPublic, showToast);

  const isMine = myUserId !== null && myUserId === userId;

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const handleWithdraw = () => {
    withdrawMutate(undefined, {
      onError: (err: any) => {
        showToast(err?.message ?? '회원탈퇴에 실패했습니다.');
      },
    });
  };

  const handleProfileEdit = () => {
    router.push(`/profile/${userId}/edit`);
  };

  return {
    profile,
    isLoading,
    error,
    loadMoreReviews,
    toast,
    isMine,
    review,
    showWithdrawModal,
    setShowWithdrawModal,
    showEditProfileModal,
    setShowEditProfileModal,
    handleWithdraw,
    handleProfileEdit,
  };
}
