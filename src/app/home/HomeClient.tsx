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

  useEffect(() => {
    setNeedsArrows(items.length >= 2 || meta.hasNext);
  }, [items.length, meta.hasNext]);

  useEffect(() => {
    // 초기 렌더링 시 스크롤바가 생기지 않을 만큼 카드가 적은데 서버에 다음 페이지가 있다면,
    // 스와이프(스크롤) 이벤트를 활성화하기 위해 추가 데이터를 미리 불러옵니다.
    const timer = setTimeout(() => {
      if (carouselRef.current && meta.hasNext && !isLoadingMore) {
        const target = carouselRef.current;
        if (target.scrollWidth <= target.clientWidth + 10) {
          loadMore();
        }
      }
    }, 200); // DOM에 카드가 렌더링될 시간 확보

    return () => clearTimeout(timer);
  }, [items.length, meta.hasNext, isLoadingMore]);

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
    if (carouselRef.current) {
      const target = carouselRef.current;
      const firstChild = target.firstElementChild as HTMLElement;
      // getBoundingClientRect().width를 사용하여 테두리(border)와 소수점 픽셀(calc)까지 정확히 계산
      const scrollAmount = firstChild ? firstChild.getBoundingClientRect().width + 12 : 300; 
      
      if (dir === "right") {
        const isAtEnd = target.scrollWidth - target.scrollLeft - target.clientWidth < scrollAmount;
        
        if (isAtEnd && meta.hasNext && !isLoadingMore) {
          const success = await loadMore();
          if (success) {
            setTimeout(() => {
              target.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }, 100);
            return;
          }
        }
        
        target.scrollBy({ left: scrollAmount, behavior: "smooth" });
      } else {
        target.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // 스크롤이 오른쪽 끝에 거의 다다랐을 때 (여유분 50px)
    if (target.scrollWidth - target.scrollLeft - target.clientWidth < 50) {
      if (meta.hasNext && !isLoadingMore) {
        loadMore();
      }
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.carouselWrapper}>
        {items.length === 0 ? (
          <div className={styles.emptyStateRail}>
            <EmptyState type="no-meetings" />
          </div>
        ) : (
          <>
            {needsArrows && (
              <button onClick={() => handleArrowClick("left")} className={styles.arrowButton}>
                <ChevronLeft size={20} />
              </button>
            )}
            <div ref={carouselRef} className={styles.carousel} onScroll={handleScroll}>
              {items.map((room) => (
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
    { title: "이런 모임은 어때요? 👀", sortKey: "recommended" as SortType, initialRooms: data?.recommended.data ?? [], initialMeta: data?.recommended.meta ?? { page: 1, size: 0, hasNext: false, hasPrev: false, totalElements: 0, totalPages: 0, sortedBy: '' } },
    { title: "방금 생긴 따끈따끈한 모임 🍞", sortKey: "latest" as SortType, initialRooms: data?.latest.data ?? [], initialMeta: data?.latest.meta ?? { page: 1, size: 0, hasNext: false, hasPrev: false, totalElements: 0, totalPages: 0, sortedBy: '' } },
    { title: "지금 가장 핫한 모임 🔥", sortKey: "popular" as SortType, initialRooms: data?.popular.data ?? [], initialMeta: data?.popular.meta ?? { page: 1, size: 0, hasNext: false, hasPrev: false, totalElements: 0, totalPages: 0, sortedBy: '' } },
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
