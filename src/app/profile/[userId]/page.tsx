'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, ChevronDown } from 'lucide-react';
import styles from '../profile.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import ReviewWriteModal from '@/components/profile/ReviewWriteModal';
import ProfileSection from '@/components/profile/ProfileSection';
import WriteReviewButton from '@/components/profile/WriteReviewButton';
import ConfirmModal from '@/components/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/profile/useProfile';
import { useReviewToggle } from '@/hooks/profile/useReviewToggle';
import { useToast } from '@/hooks/useToast';
import { createReview } from '@/api/user';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn, myUserId, logout } = useAuth();
  const { profile, isLoading, error, loadMoreReviews } = useProfile(userId);
  const reviewToggle = useReviewToggle(userId);
  const { toast, showToast } = useToast();

  const isMine = myUserId !== null && myUserId === userId;

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const handleReviewVisibilityToggle = useCallback(async () => {
    if (!profile || !isMine) return;
    try {
      await reviewToggle.mutateAsync(!profile.reviewsPublic);
      showToast(profile.reviewsPublic ? '리뷰가 비공개되었습니다.' : '리뷰가 공개되었습니다.');
    } catch {
      showToast('리뷰 공개 설정 변경 실패');
    }
  }, [profile, isMine, reviewToggle, showToast]);

  const handleProfileEdit = useCallback(() => {
    router.push(`/profile/${userId}/edit`);
  }, [router, userId]);

  if (error) {
    return (
      <div className={styles.container}>
        <TopNav />
        <div className={styles.loading}>
          프로필을 불러오지 못했습니다. (API 통신 에러)
        </div>
      </div>
    );
  }

  if (isLoggedIn === false) {
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <div>로그인이 필요합니다.</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <TopNav />
        <div className={styles.loading}>불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <TopNav />

      <div className={styles.inner}>
        <ProfileSection
          profile={profile}
          isMine={isMine}
          onProfileEdit={() => setShowEditProfileModal(true)}
          onLogout={() => setShowWithdrawModal(true)}
        />

        <div className={styles.reviewCard}>
          <div className={styles.reviewHeader}>
            <h3 className={styles.sectionTitle}>별점 및 리뷰</h3>
            {isMine ? (
              <div className={styles.visibilityToggle}>
                <span className={styles.visibilityLabel}>다른 사용자에게 리뷰 표시</span>
                <div className={styles.togglePill}>
                  <button
                    className={`${styles.toggleBtn} ${profile.reviewsPublic ? styles.toggleActive : ''}`}
                    onClick={handleReviewVisibilityToggle}
                  >
                    공개
                  </button>
                  <button
                    className={`${styles.toggleBtn} ${!profile.reviewsPublic ? styles.toggleActive : ''}`}
                    onClick={handleReviewVisibilityToggle}
                  >
                    비공개
                  </button>
                </div>
              </div>
            ) : (
              <WriteReviewButton onClick={() => setShowReviewModal(true)} />
            )}
          </div>

          <div className={styles.ratingSummary}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.floor(profile.rating) ? styles.starFilled : styles.starEmpty}
                />
              ))}
            </div>
            <span className={styles.ratingValue}>{profile.rating}</span>
            <span className={styles.reviewCount}>(리뷰 {profile.reviewCount}개)</span>
          </div>

          <div className={styles.reviewList}>
            {profile.reviews.map((review: any, index: number) => (
              <div
                key={review.id}
                className={`${styles.reviewItem} ${index > 0 ? styles.reviewItemBorder : ''}`}
              >
                <div className={styles.reviewAvatarCircle}>
                  {review.reviewerNickname.charAt(0)}
                </div>
                <div className={styles.reviewContent}>
                  <div className={styles.reviewMeta}>
                    <span className={styles.reviewAuthor}>{review.reviewerNickname}</span>
                    <span className={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.reviewStarRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= review.rating ? styles.starFilled : styles.starEmpty}
                      />
                    ))}
                  </div>
                  <p className={styles.reviewText}>{review.content}</p>
                </div>
              </div>
            ))}
          </div>

          {profile.reviewsMeta.hasNext && (
            <button className={styles.loadMoreBtn} onClick={loadMoreReviews}>
              리뷰 더보기
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      </div>

      <BottomNav />

      {toast && <div className={styles.toastMessage}>{toast}</div>}

      {showReviewModal && (
        <ReviewWriteModal
          targetUser={profile}
          onClose={() => setShowReviewModal(false)}
          onSubmit={async (rating, content) => {
            try {
              await createReview(userId, { rating, comment: content });
              queryClient.invalidateQueries({ queryKey: ['profile', userId] });
              setShowReviewModal(false);
              showToast('리뷰가 등록되었습니다.');
            } catch {
              showToast('리뷰 등록에 실패했습니다.');
            }
          }}
        />
      )}

      <ConfirmModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        onConfirm={() => { setShowEditProfileModal(false); handleProfileEdit(); }}
        title="프로필을 수정하시겠습니까?"
        confirmText="수정하기"
      />
      <ConfirmModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onConfirm={() => { setShowWithdrawModal(false); logout(); }}
        title="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
      />
    </div>
  );
}
