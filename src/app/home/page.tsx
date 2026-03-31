"use client";

import { useRef } from "react";
import styles from "./home.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        <button onClick={() => scroll("left")} className={styles.arrowButton}>
          <ChevronLeft size={20} />
        </button>
        <div ref={carouselRef} className={styles.carousel}>
          {rooms.map((room) => (
            <HomeGatheringCard key={room.id} room={room} />
          ))}
        </div>
        <button onClick={() => scroll("right")} className={styles.arrowButton}>
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data, isLoading } = useHome();

  const sections = [
    { title: "추천 모임", rooms: data?.recommended.data ?? [] },
    { title: "최신 모임", rooms: data?.latest.data ?? [] },
    { title: "인기 모임", rooms: data?.popular.data ?? [] },
  ];

  return (
    <div className={styles.container}>
      <TopNav />

      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.loading}>불러오는 중...</div>
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
