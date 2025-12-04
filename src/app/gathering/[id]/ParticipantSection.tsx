import React from 'react';
import styles from './roomDetail.module.css';
import { GatheringParticipant } from '@/lib/rooms';

export function ParticipantSection({
  participants,
  capacity,
}: {
  participants: GatheringParticipant[];
  capacity: number;
}) {
  const [page, setPage] = React.useState(0);
  const pageSize = 5;
  const pages = Math.max(1, Math.ceil(participants.length / pageSize));
  const start = page * pageSize;
  const slice = participants.slice(start, start + pageSize);
  console.log("participants:", participants);
  return (
    <section className={styles.participantSection}>
      <div className={styles.participantHeader}>참여 인원 ({participants.length}/{capacity})</div>
      {participants.length === 0 ? (
        <div className={styles.participantEmpty}>참여자가 없습니다</div>
      ) : (
        <div className={styles.carouselWrap}>
          <button
            className={styles.carouselNav}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ◀
          </button>
          <ul className={styles.carouselList}>
            {slice.map((u) => (
              <li key={u.userId} className={styles.participantCard}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.participantImage}
                  src={u.profileImageUrl || '/images/logo.png'}
                  alt={u.nickname}
                />
                <span className={styles.participantNickname}>{u.nickname}</span>
              </li>
            ))}
          </ul>
          <button
            className={styles.carouselNav}
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            disabled={page >= pages - 1}
          >
            ▶
          </button>
        </div>
      )}
    </section>
  );
}

