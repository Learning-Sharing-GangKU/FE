'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search } from 'lucide-react';
import styles from './category.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import CategorySelectModal from '@/components/CategorySelectModal';
import ListGatheringCard from '@/components/gathering/ListGatheringCard';
import type { GatheringItem } from '@/types/gathering';
import { useGatheringList } from '@/hooks/gathering/useGatheringList';

const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'latest',  label: '최신순' },
];

export default function CategoryClient() {
  const [sort, setSort] = useState<'popular' | 'latest'>('popular');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // SSR로 초기 데이터(인기순 1페이지)가 이미 채워짐 → 첫 로딩 즉시 표시
  // 필터 변경 시에는 client fetch
  const { data } = useGatheringList({
    category: selectedCategories[0],
    page: 1,
    size: 12,
    sort,
  });

  const gatherings = data?.data ?? [];
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '인기순';

  return (
    <div className={styles.container}>
      <TopNav />

      <main className={styles.main}>
        {/* 필터 바 */}
        <div className={styles.filterBar}>
          <button
            type="button"
            className={styles.categoryButton}
            onClick={() => setShowCategoryModal(true)}
          >
            {selectedCategories.length > 0
              ? `카테고리 (${selectedCategories.length})`
              : '카테고리'}
          </button>

          <div className={styles.sortWrapper}>
            <span className={styles.sortLabel}>정렬:</span>
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownToggle}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {currentSortLabel}
                <ChevronDown size={16} />
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {SORT_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={`${styles.dropdownItem} ${sort === option.value ? styles.dropdownItemActive : ''}`}
                      onClick={() => {
                        setSort(option.value as 'popular' | 'latest');
                        setDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 모임 리스트 */}
        {gatherings.length === 0 ? (
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
          <div className={styles.listWrapper}>
            {gatherings.map((g) => (
              <ListGatheringCard key={g.id} gathering={g} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />

      {showCategoryModal && (
        <CategorySelectModal
          mode="group"
          initialSelected={selectedCategories}
          onConfirm={(cats) => setSelectedCategories(cats)}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
}
