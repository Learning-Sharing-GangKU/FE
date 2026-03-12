"use client";

import { useAuth } from '@/contexts/AuthContext'
import React, { Suspense, useEffect, useRef, useState } from "react";
import styles from "./home.module.css";
import { ArrowLeft, ArrowRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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
  rooms: { id: number; title: string; imageUrl: string | null }[];
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

const mapToRooms = (data: any) =>
  data?.data?.map((g: any) => ({
    id: g.id,
    title: g.title,
    imageUrl: g.gatheringImageUrl ?? null,
  })) ?? [];

const HomePageContent = () => {
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

  const sections = [
    { title: '추천 모임', query: recommendedQuery, ref: refRecommended },
    { title: '최신 모임', query: latestQuery,      ref: refLatest },
    { title: '인기 모임', query: popularQuery,      ref: refPopular },
  ] as const;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>GangKU 홈</h1>

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

      <div className={styles.main}>
        {toast && (
          <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', padding: '8px 12px', borderRadius: 8, zIndex: 1000 }}>
            {toast}
          </div>
        )}

        {sections.map(({ title, query, ref }) =>
          query.isSuccess ? (
            <Section
              key={title}
              title={title}
              rooms={mapToRooms(query.data)}
              carouselRef={ref}
              onLeft={() => scrollLeft(ref)}
              onRight={() => scrollRight(ref)}
            />
          ) : null
        )}
      </div>

      <BottomNav active="/home" />
    </div>
  );
};

const HomePage = () => (
  <Suspense fallback={<div />}>
    <HomePageContent />
  </Suspense>
);

export default HomePage;
