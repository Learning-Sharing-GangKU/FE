import React from 'react';
import styles from './roomDetail.module.css';

export function RoomMeta({ host, date, place }: { host: string; date: string; place: string }) {
  return (
    <ul className={styles.metaList}>
      <li className={styles.metaItem}>호스트 · {host}</li>
      <li className={styles.metaItem}>날짜 · {new Date(date).toLocaleDateString()}</li>
      <li className={styles.metaItem}>장소 · {place}</li>
    </ul>
  );
}




