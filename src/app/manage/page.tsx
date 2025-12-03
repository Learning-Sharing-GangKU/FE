'use client';

import React from 'react';
import Link from 'next/link';
import styles from './manage.module.css';
import { getAccessToken } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import { Home, List, Plus, Users, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface GatheringItem {
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  hostName: string;
  participantCount: number;
  capacity: number;
}

export default function ManagePage() {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'host' | 'guest'>('host');

  /** 🔥 React Query fetcher */
  const fetchUserGatherings = async (role: 'host' | 'guest'): Promise<GatheringItem[]> => {
    const token = getAccessToken();
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) return [];
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/gatherings?role=${role}&page=1&size=10&sort=createdAt,desc`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      }
    );

    if (!res.ok) throw new Error('모임 불러오기 실패');
    const data = await res.json();
    const list = data.data ?? [];
    return list.map((g: any) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      imageUrl: g.gatheringImageUrl ?? null, // 매핑 중요!!
      hostName: g.hostName,
      participantCount: g.participantCount,
      capacity: g.capacity
    }));
  };

  /** 🔥 React Query */
  const { data: gatherings = [], isLoading } = useQuery({
    queryKey: ['myGatherings', activeTab],
    queryFn: () => fetchUserGatherings(activeTab),
    enabled: isLoggedIn === true,
  });

  // 로그인 체크 중
  if (isLoggedIn === null) return null;

  // 로그인 안 됨
  if (isLoggedIn === false) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <LoginRequiredModal />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>모임 관리</h1>

      {/* 탭 */}
      <div className={styles.tabWrapper}>
        <button
          className={`${styles.tabButton} ${activeTab === 'host' ? styles.active : ''}`}
          onClick={() => setActiveTab('host')}
        >
          내가 만든 모임
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'guest' ? styles.active : ''}`}
          onClick={() => setActiveTab('guest')}
        >
          참여한 모임
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>불러오는 중...</div>
      ) : gatherings.length > 0 ? (
        <div className={styles.listWrapper}>
          {gatherings.map((g) => (
            <Link href={`/gathering/gath_${g.id}`} key={g.id} className={styles.card}>
              <div className={styles.imageBox}>
                <img src={g.imageUrl || '/images/placeholder.png'} alt={g.title} className={styles.image} />
              </div>
              <div className={styles.infoBox}>
                <p className={styles.categoryTag}>#{g.category}</p>
                <p className={styles.title}>{g.title}</p>
                <p className={styles.meta}>
                  {g.hostName} {g.participantCount}/{g.capacity}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyWrapper}>
          <div className={styles.emptyBox}>
            <img src="/images/logo.png" alt="GangKU 로고" className={styles.logoImage} />
          </div>
          <p className={styles.emptyText}>{activeTab === 'host' ? '만든 모임이 없습니다' : '참여한 모임이 없습니다'}</p>
          <p className={styles.subText}>
            {activeTab === 'host' ? '어떤 모임을 만들지 고민이신가요?' : '새로운 모임을 찾아보세요!'}
          </p>
          <Link
            href={activeTab === 'host' ? '/gathering/create' : '/category'}
            className={styles.actionButton}
          >
            {activeTab === 'host' ? '모임 생성하기' : '둘러보기'}
          </Link>
        </div>
      )}

      {/* 바텀 네비 */}
      <nav className={styles.bottomNav}>
        <Link href="/home" className={styles.navItem}><Home size={20} /><div>홈</div></Link>
        <Link href="/category" className={styles.navItem}><List size={20} /><div>카테고리</div></Link>
        <Link href="/gathering/create" className={styles.navItem}><Plus size={20} /><div>모임 생성</div></Link>
        <Link href="/manage" className={`${styles.navItem} ${styles.active}`}><Users size={20} /><div>모임 관리</div></Link>
        <Link href="/profile" className={styles.navItem}><User size={20} /><div>내 페이지</div></Link>
      </nav>
    </div>
  );
}