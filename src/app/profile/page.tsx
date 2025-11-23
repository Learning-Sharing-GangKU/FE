'use client';

import React, { useState, useEffect} from 'react';
import Link from 'next/link';
import styles from './profile.module.css';
import { Home, List, Plus, Users, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoginRequiredModal from '@/components/LoginRequiredModal';

const MyProfilePage: React.FC = () => {
  const { logout } = useAuth();
  const [reviewsVisible, setReviewsVisible] = useState(true);
  const [showMore, setShowMore] = useState(false);

  const user = {
    name: '알렉스',
    location: '서울, 대한민국',
    categories: ['여행', '사진', '요리'],
    rating: 4.5,
    reviewCount: 23,
    reviews: [
      {
        id: 1,
        author: '김민준',
        rating: 5,
        text: '알렉스님 덕분에 정말 즐거운 하이킹이었어요! 다음에 또 같이 가고 싶어요.',
        date: '2일 전',
      },
      {
        id: 2,
        author: '이수진',
        rating: 4,
        text: '친절하고 유쾌하신 분입니다. 다만 약속 시간에 조금 늦으셨어요.',
        date: '1주 전',
      },
    ],
  };

  const visibleReviews = showMore ? user.reviews : user.reviews.slice(0, 2);

   // ⭐ 로그인 차단 상태
    const [isReady, setIsReady] = useState(false);
    const { isLoggedIn } = useAuth();

    // ⭐ 로그인 여부 판단 후 UI 차단/허용
    useEffect(() => {
      if (isLoggedIn === null || isLoggedIn === undefined) return;
      setIsReady(true);
    }, [isLoggedIn]);
  
    // ⭐ 로그인 여부 확인 전 → 아무것도 보여주지 않기
    if (!isReady) return null;
  
    // ⭐ 로그인 안 된 상태 → 모달만 표시
    if (isLoggedIn === false) {
      return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
          <LoginRequiredModal />
        </div>
      );
    }

  return (
    <div className={styles.container}>
      {/* 상단 로그아웃 */}
      <button className={styles.logoutButton} onClick={logout}>
        로그아웃
      </button>

      {/* 제목 */}
      <h1 className={styles.pageTitle}>내 프로필</h1>

      {/* ① 프로필 */}
      <div className={styles.profileSection}>
        <div className={styles.profileImage}></div>
        <div>
          <p className={styles.name}>{user.name}</p>
          <p className={styles.location}>{user.location}</p>
        </div>
      </div>

      {/* ② 선호 카테고리 */}
      <div className={styles.categorySection}>
        <p className={styles.sectionTitle}>선호 카테고리</p>
        <div className={styles.categoryTags}>
          {user.categories.map((c, i) => (
            <span key={i} className={styles.tag}>
              {c}
            </span>
          ))}
        </div>
        <button className={styles.editButton}>프로필 편집</button>
      </div>

      {/* ③ 별점 및 리뷰 */}
      <div className={styles.reviewSection}>
        <div className={styles.reviewHeader}>
          <p className={styles.sectionTitle}>별점 및 리뷰</p>
          <label className={styles.toggle}>
            <span>리뷰 비공개</span>
            <input
              type="checkbox"
              checked={reviewsVisible}
              onChange={() => setReviewsVisible(!reviewsVisible)}
            />
            <span className={styles.slider}></span>
            <span>공개</span>
          </label>
        </div>

        <div className={styles.ratingBox}>
          <p className={styles.stars}>⭐ {user.rating} ({`리뷰 ${user.reviewCount}개`})</p>
        </div>

        {reviewsVisible && (
          <div className={styles.reviewList}>
            {visibleReviews.map((r) => (
              <div key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewAuthor}>
                  <div className={styles.reviewImage}></div>
                  <div>
                    <p className={styles.reviewName}>{r.author}</p>
                    <p className={styles.reviewStars}>⭐ {r.rating}</p>
                  </div>
                  <span className={styles.reviewDate}>{r.date}</span>
                </div>
                <p className={styles.reviewText}>{r.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* 더보기 / 접기 */}
        <div className={styles.reviewToggle}>
          <button onClick={() => setShowMore(!showMore)} className={styles.moreButton}>
            {showMore ? '리뷰 접기 ▲' : '리뷰 더보기 ▼'}
          </button>
        </div>
      </div>

      {/* ④ 회원탈퇴 */}
      <button className={styles.deleteButton}>회원 탈퇴</button>

      {/* ⑤ 하단 네비게이션 */}
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
        <Link href="/profile" className={`${styles.navItem} ${styles.active}`}>
          <User size={20} />
          <div>내 프로필</div>
        </Link>
      </nav>
    </div>
  );
};

export default MyProfilePage;