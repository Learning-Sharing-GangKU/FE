'use client';

import Link from 'next/link';
import { Home, List, Plus, Users, User } from 'lucide-react';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { href: '/home',             icon: Home,  label: '홈' },
  { href: '/category',         icon: List,  label: '카테고리' },
  { href: '/gathering/create', icon: Plus,  label: '모임 생성' },
  { href: '/manage',           icon: Users, label: '모임 관리' },
  { href: '/profile',          icon: User,  label: '내 페이지' },
] as const;

interface Props {
  active?: string;
}

export default function BottomNav({ active }: Props) {
  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`${styles.navItem} ${active === href ? styles.active : ''}`}
        >
          <Icon size={20} />
          <div>{label}</div>
        </Link>
      ))}
    </nav>
  );
}
