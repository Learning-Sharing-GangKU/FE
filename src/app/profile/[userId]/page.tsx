'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, ChevronDown } from 'lucide-react';
import styles from '../profile.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import LoginRequiredModal from '@/components/auth/LoginRequiredModal';
import ReviewWriteModal from '@/components/profile/ReviewWriteModal';
import ProfileSection from '@/components/profile/ProfileSection';
import WriteReviewButton from '@/components/profile/WriteReviewButton';
import ConfirmModal from '@/components/ConfirmModal';
import { useProfilePage } from '@/hooks/profile/useProfilePage';

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const {
    profile,
    isMine,
    isReady,
    isLoggedIn,
    logout,
    loadMoreReviews,
    handleReviewVisibilityToggle,
    handleProfileEdit,
    toast,
  } = useProfilePage(userId);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  if (!isReady) return null;

  if (isLoggedIn === false) {
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <LoginRequiredModal />
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
        {/* 프로필 섹션 */}
        <ProfileSection
          profile={profile}
          isMine={isMine}
          onProfileEdit={() => setShowEditProfileModal(true)}
          onLogout={() => setShowWithdrawModal(true)}
        />

        {/* 리뷰 카드 */}
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

          {/* 평점 요약 */}
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

          {/* 리뷰 목록 */}
          <div className={styles.reviewList}>
            {profile.reviews.map((review, index) => (
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
          onSubmit={() => {
            // TODO: src/hooks에서 리뷰 제출 API 연결 예정
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
