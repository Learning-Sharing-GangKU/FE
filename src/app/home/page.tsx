"use client";

import styles from "./home.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import HomeGatheringCard from "@/components/home/HomeGatheringCard";
import type { GatheringItem } from "@/types/gathering";

function Section({
  title,
  rooms,
  onLeft,
  onRight,
}: {
  title: string;
  rooms: GatheringItem[];
  onLeft: () => void;
  onRight: () => void;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.carouselWrapper}>
        <button onClick={onLeft} className={styles.arrowButton}>
          <ChevronLeft size={20} />
        </button>
        <div className={styles.carousel}>
          {rooms.map((room) => (
            <HomeGatheringCard key={room.id} room={room} />
          ))}
        </div>
        <button onClick={onRight} className={styles.arrowButton}>
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

export default function HomePage() {
  // TODO: src/hooks에서 데이터 및 스크롤 핸들러 주입 예정
  const recommendedGatheringItems: GatheringItem[] = [];
  const latestGatheringItems: GatheringItem[] = [];
  const popularGatheringItems: GatheringItem[] = [];

  const sections = [
    { title: "추천 모임", rooms: recommendedGatheringItems },
    { title: "최신 모임", rooms: latestGatheringItems },
    { title: "인기 모임", rooms: popularGatheringItems },
  ];

  return (
    <div className={styles.container}>
      <TopNav />

      <main className={styles.main}>
        {sections.map(({ title, rooms }) => (
          <Section
            key={title}
            title={title}
            rooms={rooms}
            onLeft={() => {}}
            onRight={() => {}}
          />
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
