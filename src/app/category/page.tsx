'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, MapPin, BookOpen, ChevronDown } from 'lucide-react';
import styles from './category.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import CategorySelectModal from '@/components/CategorySelectModal';
import type { GatheringItem } from '@/types/gathering';

const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'latest',  label: '최신순' },
];

export default function CategoryPage() {
  // UI 상태만 유지
  const [sort, setSort] = useState<'popular' | 'latest'>('popular');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // TODO: src/hooks에서 데이터 및 필터 핸들러 주입 예정
  const gatherings: GatheringItem[] = [];

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '인기순';

  return (
    <div className={styles.container}>
      <TopNav />

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>모임 둘러보기</h1>

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
        <div className={styles.listWrapper}>
          {gatherings.length === 0 ? (
            <div className={styles.empty}>모임이 없습니다.</div>
          ) : (
            gatherings.map((g) => (
              <Link href={`/gathering/gath_${g.id}`} key={g.id} className={styles.card}>
                <div className={styles.imageBox}>
                  <img
                    src={g.imageUrl ?? '/images/logo.png'}
                    alt={g.title}
                    className={styles.image}
                  />
                </div>
                <div className={styles.infoBox}>
                  <h3 className={styles.title}>{g.title}</h3>
                  {g.description && (
                    <p className={styles.description}>{g.description}</p>
                  )}
                  <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                      <Users size={14} />
                      <span>{g.participantCount}/{g.capacity}명</span>
                    </div>
                    {g.location && (
                      <div className={styles.metaItem}>
                        <MapPin size={14} />
                        <span>{g.location}</span>
                      </div>
                    )}
                    {g.category && (
                      <div className={styles.metaItem}>
                        <BookOpen size={14} />
                        <span>{g.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      <BottomNav active="/category" />

      {showCategoryModal && (
        <CategorySelectModal
          max={1}
          selected={selectedCategories}
          setSelected={setSelectedCategories}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
}
