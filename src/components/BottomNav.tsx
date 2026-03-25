'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, FolderOpen, User } from 'lucide-react';
import styles from './BottomNav.module.css';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/home',             icon: Home,        label: '홈' },
  { href: '/category',         icon: Search,      label: '모임 둘러보기' },
  { href: '/gathering/create', icon: PlusCircle,  label: '모임 생성' },
  { href: '/manage',           icon: FolderOpen,  label: '모임 관리' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { myUserId } = useAuth();
  const profileHref = myUserId !== null ? `/profile/${myUserId}` : '/login';

  const isActive = (href: string) => pathname.startsWith(href);
  const isProfileActive = pathname.startsWith('/profile');

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.item} ${active ? styles.active : ''}`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
        <Link
          href={profileHref}
          className={`${styles.item} ${isProfileActive ? styles.active : ''}`}
        >
          <User size={24} strokeWidth={isProfileActive ? 2.5 : 1.5} />
          <span>프로필</span>
        </Link>
      </div>
    </nav>
  );
}
