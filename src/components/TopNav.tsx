'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './TopNav.module.css';
import Image from 'next/image';
import iconImg from '@/app/icon.png';
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
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/home" className={styles.logo} aria-label="홈으로 이동">
            <span className={styles.logoText}>GangKU</span>
            <Image src={iconImg} alt="GangKU Icon" width={24} height={24} className={styles.logoImage} />
          </Link>
          <div className={styles.middleSpacer} />
          <div className={styles.authArea}>
            {isLoggedIn !== null && (
              <button onClick={handleAuthClick} className={styles.authBtn}>
                {isLoggedIn ? '로그아웃' : '로그인'}
              </button>
            )}
          </div>
        </div>
      </header>
      <div className={styles.spacer} />
    </>
  );
}
