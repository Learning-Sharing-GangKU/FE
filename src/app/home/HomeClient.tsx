"use client";

import { useRef } from "react";
import Link from "next/link";
import styles from "./home.module.css";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import HomeGatheringCard from "@/components/home/HomeGatheringCard";
import type { GatheringItem } from "@/types/gathering";
import { useHome } from "@/hooks/gathering/useGatheringList";

function Section({ title, rooms }: { title: string; rooms: GatheringItem[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.carouselWrapper}>
        <button type="button" onClick={() => scroll("left")} className={styles.arrowButton}>
          <ChevronLeft size={20} />
        </button>
        <div ref={carouselRef} className={styles.carousel}>
          {rooms.map((room) => (
            <HomeGatheringCard key={room.id} room={room} />
          ))}
        </div>
        <button type="button" onClick={() => scroll("right")} className={styles.arrowButton}>
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

export default function HomeClient() {
  // SSR로 미리 채워진 데이터를 React Query가 즉시 사용 (isLoading = false)
  const { data } = useHome();

  const sections = [
    { title: "추천 모임", rooms: data?.recommended.data ?? [] },
    { title: "최신 모임", rooms: data?.latest.data ?? [] },
    { title: "인기 모임", rooms: data?.popular.data ?? [] },
  ];

  const isEmpty = sections.every(({ rooms }) => rooms.length === 0);

  return (
    <div className={styles.container}>
      <TopNav />
      <main className={styles.main}>
        {isEmpty ? (
          <div className={styles.emptyWrapper}>
            <div className={styles.emptyIconWrap}>
              <div className={styles.emptyIconCircle}>
                <Search size={64} color="#374151" strokeWidth={1.5} />
              </div>
              <div className={styles.emptyDecorPing} />
              <div className={styles.emptyDecorDot} />
            </div>
            <div className={styles.emptyTextWrap}>
              <h2 className={styles.emptyTitle}>모임이 없습니다.</h2>
              <p className={styles.emptyMessage}>아직 등록된 모임이 없어요.{"\n"}첫 번째 모임을 만들어보세요!</p>
            </div>
            <Link href="/gathering/create" className={styles.emptyButton}>
              <Search size={20} />
              모임 만들기
            </Link>
          </div>
        ) : (
          sections.map(({ title, rooms }) => (
            <Section key={title} title={title} rooms={rooms} />
          ))
        )}
      </main>
      <BottomNav />
    </div>
  );
}
