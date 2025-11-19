'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAccessToken } from '@/lib/auth';
import styles from './category.module.css';
import { Home, List, Plus, Users, User, ChevronDown } from 'lucide-react';
import CategorySelectModal from '@/components/CategorySelectModal'

// ✅ 인터페이스 정의
interface GatheringItem {
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  hostName: string;
  participantCount: number;
  capacity: number;
}

export default function CategoryPage() {
  const [sort, setSort] = useState<'popular' | 'latest'>('popular');
  const [category, setCategory] = useState<string | null>(null);
  const [gatherings, setGatherings] = useState<GatheringItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // ✅ API 호출
  useEffect(() => {
    const fetchGatherings = async () => {
      try {
        setLoading(true);
        const token = getAccessToken();
        const query = new URLSearchParams();
        if (category) query.append('category', category);
        query.append('sort', sort);
        query.append('size', '10');

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings?${query.toString()}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: 'include',
          }
        );

        if (!res.ok) throw new Error(`모임 불러오기 실패: ${res.status}`);
        const data = await res.json();
        setGatherings(data.data ?? []);
      } catch (err) {
        console.error('❌ 카테고리 모임 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGatherings();
  }, [category, sort]);

 
  return (
    <div className={styles.container}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>카테고리</h1>
      </header>

      {/* 카테고리 선택 버튼 */}
      <button
        type="button"
        className={styles.categoryButton}
        onClick={() => setShowCategoryModal(true)}
    >
        {selectedCategories.length > 0
            ? `카테고리 선택 (${selectedCategories.length})`
            : '카테고리 선택'}
      </button>

      {/* 정렬 버튼 */}
      <div className={styles.sortWrapper}>
        <span>정렬:</span>
        <button
          onClick={() => setSort(sort === 'popular' ? 'latest' : 'popular')}
          className={styles.sortButton}
        >
          {sort === 'popular' ? '인기순' : '최신순'} <ChevronDown size={16} />
        </button>
      </div>

      {/* 모임 리스트 */}
      <div className={styles.listWrapper}>
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : gatherings.length === 0 ? (
          <div className={styles.empty}>모임이 없습니다.</div>
        ) : (
          gatherings.map((g) => (
            <Link href={`/gathering/${g.id}`} key={g.id} className={styles.card}>
              <div className={styles.imageBox}>
                <img
                  src={g.imageUrl || '/images/placeholder.png'}
                  alt={g.title}
                  className={styles.image}
                />
              </div>
              <div className={styles.infoBox}>
                <p className={styles.categoryTag}>#{g.category}</p>
                <p className={styles.title}>{g.title}</p>
                <p className={styles.meta}>
                  {g.hostName} · {g.participantCount}/{g.capacity}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      {showCategoryModal && (
  <CategorySelectModal
    max={1}
    selected={selectedCategories}
    setSelected={setSelectedCategories}
    onClose={() => {
      setShowCategoryModal(false);
      if (selectedCategories.length > 0) {
        setCategory(selectedCategories[0]); // ✅ 첫 번째 선택 카테고리로 API 필터 적용
      }
    }}
  />
)}


      {/* 하단 네비게이션 */}
      <nav className={styles.bottomNav}>
        <Link href="/home" className={styles.navItem}>
          <Home size={20} />
          <div>홈</div>
        </Link>
        <Link href="/category" className={`${styles.navItem} ${styles.active}`}>
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
          <div>내 페이지</div>
        </Link>
      </nav>
    </div>
  );
}