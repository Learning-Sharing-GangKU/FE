'use client';

import React, { useEffect, useState } from 'react';
import styles from './profile.module.css';
import Link from 'next/link';
import { Home, List, Plus, Users, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import { useRouter } from 'next/navigation';

// 리뷰 타입
interface ReviewItem {
  id: string;
  reviewerId: string;
  reviewerProfileImageUrl: string | null;
  reviewerNickname: string;
  content: string;
  rating: number;
  createdAt: string;
}

interface ReviewsMeta {
  size: number;
  sortedBy: string;
  nextCursor: string | null;
  hasNext: boolean;
}

interface UserProfile {
  id: string;
  profileImageUrl: string | null;
  nickname: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  enrollNumber: number;
  preferredCategories: string[];

  rating: number;
  reviewCount: number;

  reviewsPublic: boolean; // 리뷰 공개 여부

  reviews: ReviewItem[];
  reviewsMeta: ReviewsMeta;
}

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const { isLoggedIn, logout, myUserId } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [isReady, setIsReady] = useState(false);

  const showToast = (msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  // 로그인 체크
  useEffect(() => {
    if (isLoggedIn !== null) setIsReady(true);
  }, [isLoggedIn]);

  const isMine =
    myUserId !== null && String(myUserId) === String(params.userId);

  // 프로필 조회
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${params.userId}`,
          { credentials: 'include' }
        );

        if (res.status === 404) {
          showToast('존재하지 않는 사용자입니다.');
          router.push('/home');
          return;
        }

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (!res.ok) throw new Error('프로필 조회 실패');

        const raw = await res.json();

        const reviews =
          raw.reviewsPreview?.data?.map((r: any) => ({
            id: r.id,
            reviewerId: r.reviewerId,
            reviewerProfileImageUrl: r.reviewerProfileImageUrl ?? null,
            reviewerNickname: r.reviewerNickname,
            content: r.content,
            rating: r.rating,
            createdAt: r.createdAt,
          })) ?? [];

        const meta =
          raw.reviewsPreview?.meta ?? {
            size: 0,
            sortedBy: '',
            nextCursor: null,
            hasNext: false,
          };

        setProfile({
          id: raw.id,
          profileImageUrl: raw.profileImageUrl ?? null,
          nickname: raw.nickname,
          age: raw.age,
          gender: raw.gender,
          enrollNumber: raw.enrollNumber,
          preferredCategories: raw.preferredCategories ?? [],

          rating: raw.rating ?? 0,
          reviewCount: raw.reviewCount ?? 0,

          reviewsPublic: raw.reviewsPublic ?? true,

          reviews,
          reviewsMeta: {
            size: meta.size,
            sortedBy: meta.sortedBy,
            nextCursor: meta.nextCursor,
            hasNext: meta.hasNext,
          },
        });
      } catch (err: any) {
        showToast(err.message);
      }
    };

    fetchProfile();
  }, [isLoggedIn, params.userId]);

  // 리뷰 더보기
  const loadMoreReviews = async () => {
    if (!profile) return;
    if (!profile.reviewsMeta.hasNext) return;

    try {
      const url =
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${profile.id}/reviews?cursor=${profile.reviewsMeta.nextCursor}`;

      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('리뷰 불러오기 실패');

      const more = await res.json();

      const newItems = more.data.map((r: any) => ({
        id: r.id,
        reviewerId: r.reviewerId,
        reviewerProfileImageUrl: r.reviewerProfileImageUrl ?? null,
        reviewerNickname: r.reviewerNickname,
        content: r.content,
        rating: r.rating,
        createdAt: r.createdAt,
      }));

      setProfile({
        ...profile,
        reviews: [...profile.reviews, ...newItems],
        reviewsMeta: {
          size: more.meta.size,
          sortedBy: more.meta.sortedBy,
          nextCursor: more.meta.nextCursor,
          hasNext: more.meta.hasNext,
        },
      });
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // 리뷰 공개/비공개 설정 PATCH
  const handleReviewVisibilityToggle = async () => {
    if (!profile) return;
    if (!isMine) {
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

  // 프로필 편집 PATCH 후 이동
  const handleProfileEdit = async () => {
    if (!isMine) {
      showToast('권한이 없습니다.');
      return;
    }

    // PATCH 호출 (프로필 업데이트는 edit 페이지에서 수행하지만, 스펙상 PATCH 후 이동 가능)
    router.push(`/profile/${profile?.id}/edit`);
  };

  // 렌더링
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
      {/* 상단 로그아웃 */}
      {isMine && (
        <button className={styles.logoutButton} onClick={logout}>
          로그아웃
        </button>
      )}

      {/* 제목 */}
      <h1 className={styles.pageTitle}>
        {isMine ? '내 프로필' : `${profile.nickname}님의 프로필`}
      </h1>

      {/* ① 프로필 */}
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

      {/* ② 선호 카테고리 */}
      <div className={styles.categorySection}>
        <p className={styles.sectionTitle}>선호 카테고리</p>

        <div className={styles.categoryTags}>
          {profile.preferredCategories.map((cat, i) => (
            <span key={i} className={styles.tag}>
              {cat}
            </span>
          ))}
        </div>

        {/* 프로필 편집 버튼 */}
        {isMine && (
          <button className={styles.editButton} onClick={handleProfileEdit}>
            프로필 편집
          </button>
        )}
      </div>

      {/* ③ 별점 + 리뷰 공개/비공개 */}
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

        {/* 리뷰 목록 */}
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

            {/* 더보기 버튼 */}
            {profile.reviewsMeta.hasNext && (
              <button className={styles.moreButton} onClick={loadMoreReviews}>
                리뷰 더보기 ▼
              </button>
            )}
          </div>
        )}
      </div>

      {/* ④ 회원 탈퇴 */}
      {isMine && (
        <button className={styles.deleteButton} onClick={logout}>
          회원 탈퇴
        </button>
      )}

      {/* 하단 네비 */}
      <nav className={styles.bottomNav}>
        <Link href="/home" className={styles.navItem}>
          <Home size={20} />
          <div>홈</div>
        </Link>

        <Link href="/category" className={styles.navItem}>
          <List size={20} />
          <div>카테고리</div>
        </Link>

        <Link href="/gathering/create" className={styles.navItem}>
          <Plus size={20} />
          <div>모임 생성</div>
        </Link>

        <Link href="/manage" className={styles.navItem}>
          <Users size={20} />
          <div>모임 관리</div>
        </Link>

        <Link
          href={`/profile/${profile.id}`}
          className={`${styles.navItem} ${styles.active}`}
        >
          <User size={20} />
          <div>내 페이지</div>
        </Link>
      </nav>

      {toast.visible && (
        <div className={styles.toast}>{toast.message}</div>
      )}
    </div>
  );
}
