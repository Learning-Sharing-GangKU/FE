'use client';

import Link from 'next/link';
import { Users, MapPin, Tag } from 'lucide-react';
import styles from './HomeGatheringCard.module.css';
import type { GatheringItem } from '@/types/gathering';

type Props = {
  room: GatheringItem;
};

export default function HomeGatheringCard({ room }: Props) {
  return (
    <Link href={`/gathering/gath_${room.id}`} className={styles.card}>
      {/* 썸네일 */}
      <div className={styles.imageWrapper}>
        <img
          src={room.imageUrl ?? '/images/logo.png'}
          alt={room.title}
          className={styles.image}
        />
      </div>

      {/* 콘텐츠 */}
      <div className={styles.content}>
        <h3 className={styles.title}>{room.title}</h3>

        {room.description && (
          <p className={styles.description}>{room.description}</p>
        )}

        <div className={styles.meta}>
          {room.participantCount != null && (
            <div className={styles.metaRow}>
              <Users size={16} className={styles.metaIcon} />
              <span>{room.participantCount}명 참여중</span>
            </div>
          )}
          {room.location && (
            <div className={styles.metaRow}>
              <MapPin size={16} className={styles.metaIcon} />
              <span>{room.location}</span>
            </div>
          )}
          {room.category && (
            <div className={styles.metaRow}>
              <Tag size={16} className={styles.metaIcon} />
              <span>{room.category}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
