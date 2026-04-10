'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './TopNav.module.css';
import { useAuth } from '@/contexts/AuthContext';

export default function TopNav() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();

  const handleAuthClick = () => {
    if (isLoggedIn) {
      logout();
    } else {
      router.push('/login');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/home" className={styles.logo} aria-label="홈으로 이동">
          <span className={styles.logoText}>GangKU</span>
          <span>🎓</span>
        </Link>
        <div className={styles.spacer} />
        <div className={styles.authArea}>
          {isLoggedIn !== null && (
            <button onClick={handleAuthClick} className={styles.authBtn}>
              {isLoggedIn ? '로그아웃' : '로그인'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
