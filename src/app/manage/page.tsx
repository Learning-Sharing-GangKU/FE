'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, MapPin, BookOpen, Sparkles, Search } from 'lucide-react';
import styles from './manage.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';

interface GatheringItem {
  id: string;
  category: string;
  title: string;
  imageUrl?: string | null;
  participantCount: number;
  capacity: number;
  description?: string;
  location?: string;
}

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created');

  // TODO: src/hooks에서 데이터 및 액션 핸들러 주입 예정
  const gatherings: GatheringItem[] = [];

  const hasNoMeetings = gatherings.length === 0;

  return (
    <div className={styles.container}>
      <TopNav />

      {/* 세그먼트 탭 */}
      <div className={styles.tabBar}>
        <div className={styles.tabInner}>
          <div className={styles.tabGroup}>
            <button
              className={`${styles.tabButton} ${activeTab === 'created' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('created')}
            >
              내가 만든 모임
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'joined' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('joined')}
            >
              내가 참여한 모임
            </button>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <main className={styles.main}>
        {hasNoMeetings ? (
          <div className={styles.emptyWrapper}>
            <div className={styles.emptyIconWrap}>
              <div className={styles.emptyIconCircle}>
                {activeTab === 'created' ? (
                  <Sparkles size={64} color="#374151" strokeWidth={1.5} />
                ) : (
                  <Users size={64} color="#374151" strokeWidth={1.5} />
                )}
              </div>
              <div className={styles.emptyDecorPing} />
              <div className={styles.emptyDecorDot} />
            </div>

            <div className={styles.emptyTextWrap}>
              <h2 className={styles.emptyTitle}>
                {activeTab === 'created' ? '만든 모임이 없습니다' : '참여한 모임이 없습니다'}
              </h2>
              <p className={styles.emptyMessage}>
                {activeTab === 'created'
                  ? '새로운 모임을 만들어\n친구들과 함께 즐거운 시간을 보내보세요!'
                  : '관심있는 모임을 찾아보고\n새로운 친구들을 만나보세요!'}
              </p>
            </div>

            <Link
              href={activeTab === 'created' ? '/gathering/create' : '/category'}
              className={styles.emptyButton}
            >
              {activeTab === 'created' ? (
                <><Sparkles size={20} />모임 만들기</>
              ) : (
                <><Search size={20} />둘러보기</>
              )}
            </Link>
          </div>
        ) : (
          <div className={styles.listWrapper}>
            {gatherings.map((g) => (
              <Link href={`/gathering/gath_${g.id}`} key={g.id} className={styles.card}>
                <div className={styles.imageBox}>
                  <img
                    src={g.imageUrl ?? '/images/logo.png'}
                    alt={g.title}
                    className={styles.image}
                  />
                </div>
                <div className={styles.infoBox}>
                  <div>
                    <h3 className={styles.cardTitle}>{g.title}</h3>
                    <p className={styles.cardDescription}>
                      {g.description ?? '함께 성장하는 대학생 스터디 모임'}
                    </p>
                  </div>
                  <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                      <Users size={16} />
                      <span>{g.participantCount}명 참여중</span>
                    </div>
                    {g.location && (
                      <div className={styles.metaItem}>
                        <MapPin size={16} />
                        <span>{g.location}</span>
                      </div>
                    )}
                    <div className={styles.metaItem}>
                      <BookOpen size={16} />
                      <span>{g.category}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav active="/manage" />
    </div>
  );
}
