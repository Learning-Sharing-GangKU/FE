'use client';

import { useParams } from 'next/navigation';
import { Star, ChevronDown, EyeOff } from 'lucide-react';
import styles from '../profile.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import ReviewWriteModal from '@/components/profile/ReviewWriteModal';
import ProfileSection from '@/components/profile/ProfileSection';
import WriteReviewButton from '@/components/profile/WriteReviewButton';
import ConfirmModal from '@/components/ConfirmModal';
import { useProfilePage } from '@/hooks/profile/useProfilePage';

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();

  const {
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
  } = useProfilePage(userId);

  if (isLoading) return null;

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
          onWithdraw={() => setShowWithdrawModal(true)}
        />

        <div className={styles.reviewCard}>
          <div className={styles.reviewHeader}>
            <h3 className={styles.sectionTitle}>별점 및 리뷰</h3>
            {isMine ? (
              <div className={styles.visibilityToggle}>
                <span className={styles.visibilityLabel}>다른 사용자에게 리뷰 표시</span>
                <div className={styles.togglePill}>
                  <button
                    className={`${styles.toggleBtn} ${review.reviewToggle.isPublic ? styles.toggleActive : ''}`}
                    onClick={() => review.reviewToggle.toggle(true)}
                  >
                    공개
                  </button>
                  <button
                    className={`${styles.toggleBtn} ${!review.reviewToggle.isPublic ? styles.toggleActive : ''}`}
                    onClick={() => review.reviewToggle.toggle(false)}
                  >
                    비공개
                  </button>
                </div>
              </div>
            ) : (
              <WriteReviewButton onClick={() => review.setShowReviewModal(true)} />
            )}
          </div>

          {/* 타인 프로필이고 리뷰 비공개인 경우 */}
          {!isMine && !profile.reviewPublic ? (
            <div className={styles.reviewsHidden}>
              <div className={styles.reviewsHiddenIcon}>
                <EyeOff size={40} color="#9ca3af" />
              </div>
              <h3 className={styles.reviewsHiddenTitle}>리뷰를 볼 수 없습니다</h3>
              <p className={styles.reviewsHiddenDesc}>
                이 사용자는 작성한 리뷰를 비공개로 설정했습니다.
              </p>
            </div>
          ) : (
            <>
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
                {profile.reviews.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    className={`${styles.reviewItem} ${index > 0 ? styles.reviewItemBorder : ''}`}
                  >
                    <div className={styles.reviewAvatarCircle}>
                      {item.reviewerNickname.charAt(0)}
                    </div>
                    <div className={styles.reviewContent}>
                      <div className={styles.reviewMeta}>
                        <span className={styles.reviewAuthor}>{item.reviewerNickname}</span>
                        <span className={styles.reviewDate}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.reviewStarRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={star <= item.rating ? styles.starFilled : styles.starEmpty}
                          />
                        ))}
                      </div>
                      <p className={styles.reviewText}>{item.content}</p>
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
            </>
          )}
        </div>
      </div>

      <BottomNav />

      {toast && <div className={styles.toastMessage}>{toast}</div>}

      {review.showReviewModal && (
        <ReviewWriteModal
          targetUser={profile}
          onClose={() => review.setShowReviewModal(false)}
          onSubmit={review.handleSubmitReview}
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
        onConfirm={() => { setShowWithdrawModal(false); handleWithdraw(); }}
        title="정말 회원탈퇴 하시겠습니까?"
        confirmText="회원탈퇴"
      />
    </div>
  );
}
