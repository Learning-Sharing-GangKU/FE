'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, FolderOpen, User } from 'lucide-react';
import styles from './BottomNav.module.css';
import { useAuth } from '@/contexts/AuthContext';
import AuthRequiredModal from '@/components/AuthRequiredModal';

const PROTECTED_HREFS = new Set(['/gathering/create', '/manage']);

const NAV_ITEMS = [
  { href: '/home',             icon: Home,        label: '홈' },
  { href: '/category',         icon: Search,      label: '모임 둘러보기' },
  { href: '/gathering/create', icon: PlusCircle,  label: '모임 생성' },
  { href: '/manage',           icon: FolderOpen,  label: '모임 관리' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { myUserId } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | undefined>(undefined);

  const isActive = (href: string) => pathname.startsWith(href);
  const isProfileActive = pathname.startsWith('/profile');

  const handleProtectedClick = (e: React.MouseEvent, href: string) => {
    if (myUserId === null && PROTECTED_HREFS.has(href)) {
      e.preventDefault();
      setPendingHref(href);
      setShowAuthModal(true);
    }
  };

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
              onClick={(e) => handleProtectedClick(e, href)}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
        <Link
          href={myUserId !== null ? `/profile/${myUserId}` : '#'}
          className={`${styles.item} ${isProfileActive ? styles.active : ''}`}
          onClick={(e) => { if (myUserId === null) { e.preventDefault(); setPendingHref(`/profile`); setShowAuthModal(true); } }}
        >
          <User size={24} strokeWidth={isProfileActive ? 2.5 : 1.5} />
          <span>프로필</span>
        </Link>
      </div>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo={pendingHref}
      />
    </nav>
  );
}
