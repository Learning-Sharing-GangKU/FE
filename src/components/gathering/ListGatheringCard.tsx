'use client';

import Link from 'next/link';
import { Users, MapPin, BookOpen } from 'lucide-react';
import styles from './ListGatheringCard.module.css';
import type { GatheringItem } from '@/types/gathering';

type Props = {
  gathering: GatheringItem;
};

export default function ListGatheringCard({ gathering }: Props) {
  return (
    <Link href={`/gathering/${gathering.id}`} className={styles.card}>
      {/* 썸네일 */}
      <div className={styles.imageBox}>
        <img
          src={gathering.imageUrl ?? '/images/logo.png'}
          alt={gathering.title}
          className={styles.image}
        />
      </div>

      {/* 텍스트 정보 */}
      <div className={styles.infoBox}>
        <div className={styles.textGroup}>
          <h3 className={styles.title}>{gathering.title}</h3>
          {gathering.description && (
            <p className={styles.description}>{gathering.description}</p>
          )}
        </div>

        <div className={styles.metaRow}>
          {gathering.participantCount != null && (
            <div className={styles.metaItem}>
              <Users size={16} />
              <span>{gathering.participantCount}명 참여중</span>
            </div>
          )}
          {gathering.location && (
            <div className={styles.metaItem}>
              <MapPin size={16} />
              <span>{gathering.location}</span>
            </div>
          )}
          {gathering.category && (
            <div className={styles.metaItem}>
              <BookOpen size={16} />
              <span>{gathering.category}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
