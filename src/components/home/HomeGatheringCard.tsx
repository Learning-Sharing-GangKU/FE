'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Calendar, MapPin, Tag } from 'lucide-react';
import styles from './HomeGatheringCard.module.css';
import type { GatheringItem } from '@/types/gathering';
import { useAuth } from '@/contexts/AuthContext';
import AuthRequiredModal from '@/components/AuthRequiredModal';

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dateString));
}

type Props = {
  room: GatheringItem;
};

export default function HomeGatheringCard({ room }: Props) {
  const { isLoggedIn } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLoggedIn === false) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <Link
        href={`/gathering/${room.id}`}
        className={styles.card}
        onClick={handleClick}
      >
        <div className={styles.imageWrapper}>
          <img
            src={room.imageUrl ?? '/images/logo.jpg'}
            alt={room.title}
            className={styles.image}
          />
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>{room.title}</h3>

          <p className={styles.description}>{room.description ?? ''}</p>

          <div className={styles.meta}>
            {room.date && (
              <div className={styles.metaRow}>
                <Calendar size={16} className={styles.metaIcon} />
                <span>{formatDate(room.date)}</span>
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

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo={`/gathering/${room.id}`}
      />
    </>
  );
}
