import React from 'react';
import styles from './roomDetail.module.css';

export function CategoryTag({ label }: { label: string }) {
  return <span className={styles.categoryTag}>{label}</span>;
}




