import React from 'react';
import styles from './roomDetail.module.css';

export function RoomImage({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className={styles.imageWrap}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.image} src={src || '/images/logo.png'} alt={alt} />
    </div>
  );
}

