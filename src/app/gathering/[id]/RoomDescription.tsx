import React from 'react';
import styles from './roomDetail.module.css';

export function RoomDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = React.useState(false);

  const displayed = expanded ? description : description.slice(0, 120);

  return (
    <div className={styles.descriptionWrap}>
      <p className={styles.descriptionText}>{displayed}</p>
      {description.length > 120 && (
        <button className={styles.moreButton} onClick={() => setExpanded((v) => !v)}>
          {expanded ? '접기' : '더보기'}
        </button>
      )}
    </div>
  );
}




