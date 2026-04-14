'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Users, MapPin, BookOpen } from 'lucide-react';
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

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo={`/gathering/${gathering.id}`}
      />
    </>
  );
}