'use client';

import styles from './WriteReviewButton.module.css';

type Props = {
  onClick: () => void;
};

export default function WriteReviewButton({ onClick }: Props) {
  return (
    <button className={styles.button} onClick={onClick}>
      리뷰 남기기
    </button>
  );
}
