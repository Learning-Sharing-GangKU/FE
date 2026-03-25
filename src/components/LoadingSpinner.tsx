'use client';

import styles from './LoadingSpinner.module.css';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return <div className={`${styles.spinner} ${styles[size]}`} />;
}

export function InlineLoading({ message }: { message?: string }) {
  return (
    <div className={styles.inline}>
      <LoadingSpinner size="md" />
      {message && <p className={styles.inlineMessage}>{message}</p>}
    </div>
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className={styles.overlay}>
      <LoadingSpinner size="lg" />
      {message && <p className={styles.overlayMessage}>{message}</p>}
    </div>
  );
}
