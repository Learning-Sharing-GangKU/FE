"use client";

import { useAuth } from '@/contexts/AuthContext'
import React, { useRef } from "react";
import styles from "./home.module.css";
import { Home, List, Plus, Users, User, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

const dummyRooms = [
  { id: 1, title: "모임 A" },
  { id: 2, title: "모임 B" },
  { id: 3, title: "모임 C" },
];

const renderGroupSection = (
  title: string,
  rooms: { id: number; title: string }[],
  carouselRef: React.RefObject<HTMLDivElement | null>,
  handleScrollLeft: () => void,
  handleScrollRight: () => void
) => (
  <div className={styles.section}>
    <h2 className={styles.sectionTitle}>{title}</h2>
    <div className={styles.carouselWrapper}>
      <button onClick={handleScrollLeft} className={styles.arrowButton}>
        <ArrowLeft size={20} />
      </button>

      <div className={styles.carousel} ref={carouselRef}>
        {rooms.map((room) => (
          <Link key={room.id} href={`/room/${room.id}`} className={styles.roomCard}>
            <div className={styles.roomCardBox}>
              <div className={styles.roomCardImage}>사진</div>
            </div>
            <div className={styles.roomCardTitle}>{room.title}</div>
          </Link>
        ))}
      </div>

      <button onClick={handleScrollRight} className={styles.arrowButton}>
        <ArrowRight size={20} />
      </button>
    </div>
  </div>
);

const HomePage = () => {
  // 캐러셀 DOM 참조
  const refRecommended = useRef<HTMLDivElement | null>(null);
  const refLatest = useRef<HTMLDivElement | null>(null);
  const refPopular = useRef<HTMLDivElement | null>(null);
  const { isLoggedIn, logout } = useAuth()

  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollLeft -= 200;
    }
  };
  
  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollLeft += 200;
    }
  };

  return (
    <div className={styles.container}>
      {/* 상단바 */}
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>GangKU 홈</h1>


        {/* 로그인 상태에 따라 버튼 조건부 렌더링 */}
        {isLoggedIn ? (
          <button onClick={logout} className={styles.loginButton}>
            로그아웃
          </button>
        ) : (
          <Link href="/login" className={styles.loginButton}>
            로그인
          </Link>
        )}
      </div>

      {/* 본문 */}
      <div className={styles.main}>
        {renderGroupSection(
          "추천 모임",
          dummyRooms,
          refRecommended,
          () => scrollLeft(refRecommended),
          () => scrollRight(refRecommended)
        )}
        {renderGroupSection(
          "최신 모임",
          dummyRooms,
          refLatest,
          () => scrollLeft(refLatest),
          () => scrollRight(refLatest)
        )}
        {renderGroupSection(
          "인기 모임",
          dummyRooms,
          refPopular,
          () => scrollLeft(refPopular),
          () => scrollRight(refPopular)
        )}
      </div>

      {/* 하단 네비게이션 */}
      <nav className={styles.bottomNav}>
        <Link href="/" className={styles.navItem}>
          <Home size={20} />
          <div>홈</div>
        </Link>
        <Link href="/category" className={styles.navItem}>
          <List size={20} />
          <div>카테고리</div>
        </Link>
        <Link href="/create" className={styles.navItem}>
          <Plus size={20} />
          <div>모임 생성</div>
        </Link>
        <Link href="/manage" className={styles.navItem}>
          <Users size={20} />
          <div>모임 관리</div>
        </Link>
        <Link href="/profile" className={styles.navItem}>
          <User size={20} />
          <div>내 프로필</div>
        </Link>
      </nav>
    </div>
  );
};

export default HomePage;