import React from 'react';
import styles from './roomDetail.module.css';

export function RoomTitle({ title }: { title: string }) {
  return <h1 className={styles.roomTitle}>{title}</h1>;
}




