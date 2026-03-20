'use client';

import Link from 'next/link';
import { Home, Search, PlusCircle, FolderOpen, User } from 'lucide-react';
import styles from './BottomNav.module.css';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/home',             icon: Home,        label: '홈' },
  { href: '/category',         icon: Search,      label: '모임 둘러보기' },
  { href: '/gathering/create', icon: PlusCircle,  label: '모임 생성' },
  { href: '/manage',           icon: FolderOpen,  label: '모임 관리' },
] as const;

interface Props {
  active?: string;
}

export default function BottomNav({ active }: Props) {
  const { myUserId } = useAuth();
  const profileHref = myUserId !== null ? `/profile/${myUserId}` : '/login';

  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`${styles.navItem} ${active === href ? styles.active : ''}`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </Link>
      ))}
      <Link
        href={profileHref}
        className={`${styles.navItem} ${active === '/profile' ? styles.active : ''}`}
      >
        <User size={20} />
        <span>프로필</span>
      </Link>
    </nav>
  );
}
