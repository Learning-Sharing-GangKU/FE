'use client';

import React from 'react';
import Link from 'next/link';
import styles from './loginModal.module.css';

// interface LoginRequiredModalProps {
//   onClose: () => void;
// }

export default function LoginRequiredModal() {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>로그인이 필요합니다</h3>
        <p className={styles.message}>
          이 기능을 사용하려면 로그인이 필요합니다.
        </p>
        <div className={styles.buttonContainer}>
          <Link href="/login" className={styles.loginButton}>
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
