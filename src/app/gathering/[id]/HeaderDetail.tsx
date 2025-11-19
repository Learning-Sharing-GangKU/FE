'use client';

import React from 'react';
import styles from './roomDetail.module.css';
import { useRouter } from 'next/navigation';

export function HeaderDetail({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className={styles.headerDetail}>
      <button aria-label="뒤로" className={styles.backButton} onClick={() => router.back()}>
        ←
      </button>
      <h2 className={styles.headerTitle}>{title}</h2>
    </div>
  );
}

