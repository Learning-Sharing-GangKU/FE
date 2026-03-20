"use client";

import type React from "react";
import styles from "./home.module.css";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  BookOpen,
  MessageSquare,
  Dumbbell,
  Palette,
  Trees,
  Music,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import Link from "next/link";

interface Room {
  id: number;
  title: string;
  description?: string;
  imageUrl: string | null;
  participantCount?: number;
  location?: string;
  category?: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  "스터디": BookOpen,
  "토론": MessageSquare,
  "운동": Dumbbell,
  "독서": BookOpen,
  "네트워킹": Users,
  "예술": Palette,
  "야외활동": Trees,
  "음악": Music,
};

function MeetingCard({ room }: { room: Room }) {
  const Icon = categoryIcons[room.category ?? ""] ?? Users;

  return (
    <Link href={`/gathering/gath_${room.id}`} className={styles.roomCard}>
      <div className={styles.roomCardImageWrapper}>
        <img
          src={room.imageUrl ?? "/images/logo.png"}
          alt={room.title}
          className={styles.roomCardImg}
        />
      </div>
      <div className={styles.roomCardContent}>
        <h3 className={styles.roomCardTitle}>{room.title}</h3>
        {room.description && (
          <p className={styles.roomCardDescription}>{room.description}</p>
        )}
        <div className={styles.roomCardInfo}>
          {room.participantCount != null && (
            <div className={styles.roomCardInfoRow}>
              <Users size={14} />
              <span>{room.participantCount}명 참여중</span>
            </div>
          )}
          {room.location && (
            <div className={styles.roomCardInfoRow}>
              <MapPin size={14} />
              <span>{room.location}</span>
            </div>
          )}
          {room.category && (
            <div className={styles.roomCardInfoRow}>
              <Icon size={14} />
              <span>{room.category}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function Section({
  title,
  rooms,
  onLeft,
  onRight,
}: {
  title: string;
  rooms: Room[];
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
            <MeetingCard key={room.id} room={room} />
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
  const recommendedRooms: Room[] = [];
  const latestRooms: Room[] = [];
  const popularRooms: Room[] = [];

  const sections = [
    { title: "추천 모임", rooms: recommendedRooms },
    { title: "최신 모임", rooms: latestRooms },
    { title: "인기 모임", rooms: popularRooms },
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

      <BottomNav active="/home" />
    </div>
  );
}
