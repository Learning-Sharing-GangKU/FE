'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { MoreVertical, Star, ChevronDown } from 'lucide-react';
import styles from '../profile.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import LoginRequiredModal from '@/components/auth/LoginRequiredModal';
import ReviewWriteModal from '@/components/profile/ReviewWriteModal';
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

  const [showMenu, setShowMenu] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

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
        {/* 프로필 카드 */}
        <div className={styles.profileCard}>
          <div className={styles.profileRow}>
            <div className={styles.avatar}>
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={profile.nickname} className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarInitial}>{profile.nickname.charAt(0)}</span>
              )}
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.profileInfoTop}>
                <div>
                  <h2 className={styles.nickname}>{profile.nickname}</h2>
                  <div className={styles.meta}>
                    <span>{profile.age}세</span>
                    <span className={styles.dot}>•</span>
                    <span>{profile.enrollNumber}학번</span>
                    <span className={styles.dot}>•</span>
                    <span>{profile.gender === 'MALE' ? '남' : '여'}</span>
                  </div>
                  <div className={styles.tags}>
                    {profile.preferredCategories.map((cat, i) => (
                      <span key={i} className={styles.tag}>{cat}</span>
                    ))}
                  </div>
                </div>

                {isMine && (
                  <div className={styles.menuWrapper}>
                    <button
                      className={styles.menuButton}
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      <MoreVertical size={20} color="#6b7280" />
                    </button>
                    {showMenu && (
                      <>
                        <div className={styles.menuBackdrop} onClick={() => setShowMenu(false)} />
                        <div className={styles.menuPopup}>
                          <button
                            className={styles.menuItem}
                            onClick={() => { setShowMenu(false); handleProfileEdit(); }}
                          >
                            프로필 수정
                          </button>
                          <button
                            className={`${styles.menuItem} ${styles.menuItemRed}`}
                            onClick={() => { setShowMenu(false); logout(); }}
                          >
                            회원탈퇴
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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
              <button className={styles.writeReviewBtn} onClick={() => setShowReviewModal(true)}>
                리뷰 남기기
              </button>
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

      <BottomNav active="/profile" />

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
    </div>
  );
}
