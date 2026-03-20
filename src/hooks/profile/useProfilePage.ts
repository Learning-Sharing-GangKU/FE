import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/profile/useProfile';
import { useToast } from '@/hooks/useToast';

export function useProfilePage(userId: string) {
  const router = useRouter();
  const { isLoggedIn, myUserId, logout } = useAuth();
  const { profile, setProfile, error, loadMoreReviews } = useProfile(userId, isLoggedIn);
  const { toast, showToast } = useToast();
  const [isReady, setIsReady] = useState(false);

  const isMine = myUserId !== null && String(myUserId) === String(userId);

  // 인증 초기화 완료 감지
  useEffect(() => {
    if (isLoggedIn !== null) setIsReady(true);
  }, [isLoggedIn]);

  // 에러 → 토스트 + 리다이렉트
  useEffect(() => {
    if (!error) return;
    showToast(error);
    if (error === '존재하지 않는 사용자입니다.') router.push('/home');
    if (error === '로그인이 필요합니다.') router.push('/login');
  }, [error]);

  // 리뷰 공개/비공개 토글
  const handleReviewVisibilityToggle = useCallback(async () => {
    if (!profile || !isMine) return;
    const newValue = !profile.reviewsPublic;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${profile.id}/review-setting`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewsPublic: newValue }),
        }
      );
      if (!res.ok) throw new Error('리뷰 공개 설정 변경 실패');
      setProfile({ ...profile, reviewsPublic: newValue });
      showToast(newValue ? '리뷰가 공개되었습니다.' : '리뷰가 비공개되었습니다.');
    } catch (err: any) {
      showToast(err.message);
    }
  }, [profile, isMine, setProfile, showToast]);

  // 프로필 수정 페이지 이동
  const handleProfileEdit = useCallback(() => {
    router.push(`/profile/${userId}/edit`);
  }, [router, userId]);

  return {
    profile,
    isMine,
    isReady,
    isLoggedIn,
    logout,
    loadMoreReviews,
    handleReviewVisibilityToggle,
    handleProfileEdit,
    toast,
  };
}
