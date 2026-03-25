'use client';

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
        <div className={styles.logo}>
          <span className={styles.logoText}>GangKU</span>
          <span>🎓</span>
        </div>
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
