"use client";

import { useAuth } from '@/contexts/AuthContext'
import React, { Suspense, useEffect, useRef, useState } from "react";
import styles from "./home.module.css";
import { Home, List, Plus, Users, User, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getGatherings, GatheringSummary} from "@/lib/rooms";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  getLatestGatherings, 
  getPopularGatherings, 
  getRecommendedGatherings 
} from "@/lib/rooms";
function Section({
  title,
  rooms,
  carouselRef,
  onLeft,
  onRight
}: {
  title: string;
  rooms: any[];
  carouselRef: React.RefObject<HTMLDivElement | null>;
  onLeft: () => void;
  onRight: () => void;
}) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>

      <div className={styles.carouselWrapper}>
        <button onClick={onLeft} className={styles.arrowButton}>
          <ArrowLeft size={20} />
        </button>

        <div className={styles.carousel} ref={carouselRef}>
          {rooms.map((room) => (
            <Link key={room.id} href={`/gathering/gath_${room.id}`} className={styles.roomCard}>
              <div className={styles.roomCardBox}>
                <div className={styles.roomCardImage}>
                  <img
                    src={room.imageUrl || "/images/logo.png"}
                    alt={room.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>
              <div className={styles.roomCardTitle}>{room.title}</div>
            </Link>
          ))}
        </div>

        <button onClick={onRight} className={styles.arrowButton}>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

const renderGroupSection = (
  title: string,
  rooms: GatheringSummary[],
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
          <Link key={room.id} href={`/gathering/${room.id}`} className={styles.roomCard}>
            <div className={styles.roomCardBox}>
              <div className={styles.roomCardImage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={room.imageUrl || "/images/logo.png"} alt={room.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
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

const HomePageContent = () => {
  // 캐러셀 DOM 참조
  const refRecommended = useRef<HTMLDivElement | null>(null);
  const refLatest = useRef<HTMLDivElement | null>(null);
  const refPopular = useRef<HTMLDivElement | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { isLoggedIn, logout } = useAuth()
  const searchParams = useSearchParams();
  const router = useRouter();

  const recommendedQuery = useQuery({
    queryKey: ["home", "recommended"],
    queryFn: getRecommendedGatherings,
  });

  const latestQuery = useQuery({
    queryKey: ["home", "latest"],
    queryFn: getLatestGatherings,
  });

  const popularQuery = useQuery({
    queryKey: ["home", "popular"],
    queryFn: getPopularGatherings,
  });


  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const el = ref.current;
      const firstCard = el.querySelector(`.${styles.roomCard}`) as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(el).gap || '12');
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : el.clientWidth;
      // 3개 기준 페이지 단위 스크롤
      const step = cardWidth * 3 + gap * 2;
      el.scrollBy({ left: -step, behavior: 'smooth' });
    }
  };
  
  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const el = ref.current;
      const firstCard = el.querySelector(`.${styles.roomCard}`) as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(el).gap || '12');
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : el.clientWidth;
      const step = cardWidth * 3 + gap * 2;
      el.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  // 모임 생성 완료 토스트 (?created=1)
  useEffect(() => {
    if (searchParams.get('created') === '1') {
      setToast('모임 생성이 완료되었습니다.');
      const sp = new URLSearchParams(Array.from(searchParams.entries()));
      sp.delete('created');
      router.replace(`/home${sp.toString() ? `?${sp.toString()}` : ''}`);
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      {/* 상단바 */}
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>GangKU 홈</h1>


        {/* 로그인 상태에 따라 버튼 조건부 렌더링 */}
        {isLoggedIn === true ? (
          <button onClick={logout} className={styles.loginButton}>
            로그아웃
          </button>
        ) : isLoggedIn === false ? (
          <Link href="/login" className={styles.loginButton}>
            로그인
          </Link>
        ) : null}
      </div>

      {/* 본문 */}
      <div className={styles.main}>
        {toast && (
          <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', padding: '8px 12px', borderRadius: 8, zIndex: 1000 }}>
            {toast}
          </div>
        )}
        {/* {isLoading && <div>로딩 중...</div>}
        {error && <div>불러오기 실패</div>} */}
        {/* {!isLoading && !error && getHomeData && getHomeData.length > 0 && ( */}
          <>
        {recommendedQuery.isSuccess && (
          <Section
            title="추천 모임"
            rooms={
              recommendedQuery.data?.data?.map((g: any) => ({
                id: g.id,
                title: g.title,
                imageUrl: g.gatheringImageUrl ?? null,
              })) ?? []
            }
            carouselRef={refRecommended}
            onLeft={() => scrollLeft(refRecommended)}
            onRight={() => scrollRight(refRecommended)}
          />
        )}
        {latestQuery.isSuccess && (
          <Section
            title="최신 모임"
            rooms={
              latestQuery.data?.data?.map((g: any) => ({
                id: g.id,
                title: g.title,
                imageUrl: g.gatheringImageUrl ?? null,
              })) ?? []
            }
            carouselRef={refLatest}
            onLeft={() => scrollLeft(refLatest)}
            onRight={() => scrollRight(refLatest)}
          />
        )}
        {popularQuery.isSuccess && (
          <Section
            title="인기 모임"
            rooms={
              popularQuery.data?.data?.map((g: any) => ({
                id: g.id,
                title: g.title,
                imageUrl: g.gatheringImageUrl ?? null,
              })) ?? []
            }
            carouselRef={refPopular}
            onLeft={() => scrollLeft(refPopular)}
            onRight={() => scrollRight(refPopular)}
          />
        )}
          </>
         {/* )} */}
        {/* {!isLoading && !error && getHomeData && getHomeData.length === 0 && (
          <div>표시할 모임이 없습니다.</div>
        )} */}
      </div>

      {/* 하단 네비게이션 */}
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
        <Link href="/profile" className={styles.navItem}>
          <User size={20} />
          <div>내 프로필</div>
        </Link>
      </nav>
    </div>
  );
};

const HomePage = () => (
  <Suspense fallback={<div />}>
    <HomePageContent />
  </Suspense>
);

export default HomePage;