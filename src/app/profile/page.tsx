'use client';

import React, { useEffect, useState } from 'react';
import styles from './profile.module.css';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const { isLoggedIn, logout, myUserId } = useAuth();

  const { profile, setProfile, error, loadMoreReviews } = useProfile(params.userId, isLoggedIn);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [isReady, setIsReady] = useState(false);

  const showToast = (msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  useEffect(() => {
    if (isLoggedIn !== null) setIsReady(true);
  }, [isLoggedIn]);

  // 에러 발생 시 토스트 + 라우팅
  useEffect(() => {
    if (!error) return;
    showToast(error);
    if (error === '존재하지 않는 사용자입니다.') router.push('/home');
    if (error === '로그인이 필요합니다.') router.push('/login');
  }, [error]);

  const isMine =
    myUserId !== null && String(myUserId) === String(params.userId);

  const handleReviewVisibilityToggle = async () => {
    if (!profile || !isMine) {
      showToast('권한이 없습니다.');
      return;
    }

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
  };

  const handleProfileEdit = () => {
    if (!isMine) {
      showToast('권한이 없습니다.');
      return;
    }
    router.push(`/profile/${profile?.id}/edit`);
  };

  if (!isReady) return null;

  if (isLoggedIn === false) {
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <LoginRequiredModal />
      </div>
    );
  }

  if (!profile) return <div>불러오는 중...</div>;

  return (
    <div className={styles.container}>
      {isMine && (
        <button className={styles.logoutButton} onClick={logout}>
          로그아웃
        </button>
      )}

      <h1 className={styles.pageTitle}>
        {isMine ? '내 프로필' : `${profile.nickname}님의 프로필`}
      </h1>

      <div className={styles.profileSection}>
        <div className={styles.profileImage}>
          {profile.profileImageUrl && (
            <img src={profile.profileImageUrl} alt="profile" />
          )}
        </div>

        <div>
          <p className={styles.name}>{profile.nickname}</p>
          <p className={styles.location}>
            {profile.gender} · {profile.age}세 · {profile.enrollNumber}학번
          </p>
        </div>
      </div>

      <div className={styles.categorySection}>
        <p className={styles.sectionTitle}>선호 카테고리</p>

        <div className={styles.categoryTags}>
          {profile.preferredCategories.map((cat, i) => (
            <span key={i} className={styles.tag}>
              {cat}
            </span>
          ))}
        </div>

        {isMine && (
          <button className={styles.editButton} onClick={handleProfileEdit}>
            프로필 편집
          </button>
        )}
      </div>

      <div className={styles.reviewSection}>
        <div className={styles.reviewHeader}>
          <p className={styles.sectionTitle}>별점 및 리뷰</p>

          {isMine && (
            <label className={styles.toggle}>
              <span>비공개</span>
              <input
                type="checkbox"
                checked={profile.reviewsPublic}
                onChange={handleReviewVisibilityToggle}
              />
              <span className={styles.slider}></span>
              <span>공개</span>
            </label>
          )}
        </div>

        <div className={styles.ratingBox}>
          <p className={styles.stars}>
            ⭐ {profile.rating} (리뷰 {profile.reviewCount}개)
          </p>
        </div>

        {profile.reviewsPublic && (
          <div className={styles.reviewList}>
            {profile.reviews.map((r) => (
              <div key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewAuthor}>
                  <div className={styles.reviewImage}>
                    {r.reviewerProfileImageUrl && (
                      <img src={r.reviewerProfileImageUrl} alt="reviewer" />
                    )}
                  </div>
                  <div>
                    <p className={styles.reviewName}>{r.reviewerNickname}</p>
                    <p className={styles.reviewStars}>⭐ {r.rating}</p>
                  </div>
                  <span className={styles.reviewDate}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={styles.reviewText}>{r.content}</p>
              </div>
            ))}

            {profile.reviewsMeta.hasNext && (
              <button className={styles.moreButton} onClick={loadMoreReviews}>
                리뷰 더보기 ▼
              </button>
            )}
          </div>
        )}
      </div>

      {isMine && (
        <button className={styles.deleteButton} onClick={logout}>
          회원 탈퇴
        </button>
      )}

      <BottomNav active="/profile" />

      {toast.visible && (
        <div className={styles.toast}>{toast.message}</div>
      )}
    </div>
  );
}
