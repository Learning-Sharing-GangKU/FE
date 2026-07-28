'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Calendar, MapPin, Tag } from 'lucide-react';

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
import styles from './ListGatheringCard.module.css';
import type { GatheringItem } from '@/types/gathering';
import { useAuth } from '@/contexts/AuthContext';
import AuthRequiredModal from '@/components/AuthRequiredModal';

type Props = {
  gathering: GatheringItem;
};

export default function ListGatheringCard({ gathering }: Props) {
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
        href={`/gathering/${gathering.id}`}
        className={styles.card}
        onClick={handleClick}
      >
        <div className={styles.imageBox}>
          <img
            src={gathering.imageUrl ?? '/images/logo.jpg'}
            alt={gathering.title}
            className={styles.image}
          />
        </div>

        <div className={styles.infoBox}>
          <div className={styles.textGroup}>
            <h3 className={styles.title}>{gathering.title}</h3>
            <p className={styles.description}>{gathering.description ?? ''}</p>
          </div>

          <div className={styles.metaRow}>
            {gathering.date && (
              <div className={styles.metaItem}>
                <Calendar size={16} />
                <span>{formatDate(gathering.date)}</span>
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
                <Tag size={16} />
                <span>{gathering.category}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo={`/gathering/${gathering.id}`}
      />
    </>
  );
}
