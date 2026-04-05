'use client';

import { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import styles from './ProfileSection.module.css';
import type { UserProfile } from '@/types/user';
import ProfileAvatar from '@/components/ProfileAvatar';

type Props = {
  profile: UserProfile;
  isMine: boolean;
  onProfileEdit: () => void;
  onWithdraw: () => void;
};

export default function ProfileSection({ profile, isMine, onProfileEdit, onWithdraw }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className={styles.profileCard}>
      <div className={styles.profileRow}>
        {/* 아바타 */}
        <ProfileAvatar
          profileImageUrl={profile.profileImageUrl}
          nickname={profile.nickname}
          size="lg"
        />

        {/* 정보 */}
        <div className={styles.profileInfo}>
          <div className={styles.profileInfoTop}>
            <div>
              <h2 className={styles.nickname}>{profile.nickname}</h2>
              <div className={styles.meta}>
                <span>{profile.age}세</span>
                <span className={styles.dot}>•</span>
                <span>{profile.enrollNumber}학번</span>
                <span className={styles.dot}>•</span>
                <span>{profile.gender === 'MALE' ? '남' : '여'}</span>
              </div>
              <div className={styles.tags}>
                {profile.preferredCategories.map((cat, i) => (
                  <span key={i} className={styles.tag}>{cat}</span>
                ))}
              </div>
            </div>

            {isMine && (
              <div className={styles.menuWrapper}>
                <button
                  className={styles.menuButton}
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical size={20} color="#6b7280" />
                </button>
                {showMenu && (
                  <>
                    <div className={styles.menuBackdrop} onClick={() => setShowMenu(false)} />
                    <div className={styles.menuPopup}>
                      <button
                        className={styles.menuItem}
                        onClick={() => { setShowMenu(false); onProfileEdit(); }}
                      >
                        프로필 수정
                      </button>
                      <button
                        className={`${styles.menuItem} ${styles.menuItemRed}`}
                        onClick={() => { setShowMenu(false); onWithdraw(); }}
                      >
                        회원탈퇴
                      </button> 
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
