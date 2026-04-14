"use client";

import { useRef, useState, useEffect } from "react";
import styles from "./home.module.css";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import HomeGatheringCard from "@/components/home/HomeGatheringCard";
import type { GatheringItem } from "@/types/gathering";
import type { PaginationMeta } from "@/types/common";
import Link from "next/link";
import { useHome } from "@/hooks/gathering/useGatheringList";
import { getGatherings } from "@/api/gathering";
import EmptyState from "@/components/EmptyState";

type SortType = "latest" | "popular" | "recommended";

function Section({ title, initialRooms, initialMeta, sortKey }: { title: string; initialRooms: GatheringItem[]; initialMeta: PaginationMeta; sortKey: SortType }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<GatheringItem[]>(initialRooms);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [needsArrows, setNeedsArrows] = useState(false);
  const [rotateOffset, setRotateOffset] = useState(0);

  useEffect(() => {
    // 2개 이상이면 회전(rotation)이 의미 있으므로 화살표 표시
    // 1개이면 회전해도 같은 카드라 의미 없으므로 숨김
    setNeedsArrows(items.length >= 2 || meta.hasNext);
  }, [items.length, meta.hasNext]);

  const loadMore = async () => {
    if (isLoadingMore || !meta.hasNext) return false;
    setIsLoadingMore(true);
    try {
      const nextPage = meta.page + 1;
      // "recommended" -> "recommend" (API 명세서 일치)
      const apiSort = sortKey === "recommended" ? "recommend" : sortKey;
      const res = await getGatherings({ sort: apiSort as any, page: nextPage, size: 3 });

      if (res.data.length > 0) {
        setItems(prev => [...prev, ...res.data]);
        setMeta(res.meta);
        return true;
      }
    } catch (err) {
      console.error("Failed to load more items:", err);
    } finally {
      setIsLoadingMore(false);
    }
    return false;
  };

  const handleArrowClick = async (dir: "left" | "right") => {
    if (dir === "right") {
      // 만약 오른쪽 화살표를 누를 때 보여질 카드가 모자라고(서버에 더 있다면) 불러옴
      // 현재 배열: items, 보여지는 선두 인덱스: rotateOffset + 1
      // 화면에 통상 3개가 보이므로 items.length 범위에 완전히 포함되지 못한다면 불러오기
      if (meta.hasNext) {
        await loadMore();
      }
      setRotateOffset(prev => prev + 1);
    } else {
      setRotateOffset(prev => prev - 1);
    }

    // 강제로 스크롤 위치를 0으로 리셋하여 깔끔하게 첫 카드가 보이도록 함
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "instant" as any });
    }
  };

  // 현재 rotateOffset 위치에 따른 배열 재배치(Infinite Circular Loop)
  const getDisplayItems = () => {
    if (items.length === 0) return [];
    const len = items.length;
    const startIndex = ((rotateOffset % len) + len) % len;
    return [...items.slice(startIndex), ...items.slice(0, startIndex)];
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.carouselWrapper}>
        {items.length === 0 ? (
          <EmptyState type="no-meetings" />
        ) : (
          <>
            {needsArrows && (
              <button onClick={() => handleArrowClick("left")} className={styles.arrowButton}>
                <ChevronLeft size={20} />
              </button>
            )}
            <div ref={carouselRef} className={styles.carousel}>
              {getDisplayItems().map((room) => (
                <HomeGatheringCard key={room.id} room={room} />
              ))}
            </div>
            {needsArrows && (
              <button onClick={() => handleArrowClick("right")} className={styles.arrowButton}>
                <ChevronRight size={20} />
              </button>
            )}
          </>
        )}

      </div>
    </section>
  );
}

export default function HomeClient() {
  // SSR로 미리 채워진 데이터를 React Query가 즉시 사용 (isLoading = false)
  const { data } = useHome();

  const sections = [
    { title: "추천 모임", sortKey: "recommended" as SortType, initialRooms: data?.recommended.data ?? [], initialMeta: data?.recommended.meta ?? { page: 1, size: 0, hasNext: false, hasPrev: false, totalElements: 0, totalPages: 0, sortedBy: '' } },
    { title: "최신 모임", sortKey: "latest" as SortType, initialRooms: data?.latest.data ?? [], initialMeta: data?.latest.meta ?? { page: 1, size: 0, hasNext: false, hasPrev: false, totalElements: 0, totalPages: 0, sortedBy: '' } },
    { title: "인기 모임", sortKey: "popular" as SortType, initialRooms: data?.popular.data ?? [], initialMeta: data?.popular.meta ?? { page: 1, size: 0, hasNext: false, hasPrev: false, totalElements: 0, totalPages: 0, sortedBy: '' } },
  ];

  const isEmpty = sections.every(({ initialRooms }) => initialRooms.length === 0);

  return (
    <div className={styles.container}>
      <TopNav />
      <main className={styles.main}>

        {isEmpty ? (
          <div className={styles.emptyWrapper}>
            <div className={styles.emptyIconWrap}>
              <div className={styles.emptyIconCircle}>
                <Search size={48} color="#9ca3af" strokeWidth={1.5} />
              </div>
              <div className={styles.emptyDecorPing} />
              <div className={styles.emptyDecorDot} />
            </div>
            <div className={styles.emptyTextWrap}>
              <h3 className={styles.emptyTitle}>참여 가능한 모임이 없습니다</h3>
              <p className={styles.emptyMessage}>새로운 모임을 개설하고 멤버를 모집해보세요!</p>
            </div>
            <Link href="/gathering/create" className={styles.emptyButton}>
              새 모임 만들기
            </Link>
          </div>
        ) : (
          sections.map(({ title, initialRooms, initialMeta, sortKey }) => (
            <Section key={title} title={title} initialRooms={initialRooms} initialMeta={initialMeta} sortKey={sortKey} />
          ))
        )}

      </main>
      <BottomNav />
    </div>
  );
}
