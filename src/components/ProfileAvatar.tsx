'use client';

import styles from './ProfileAvatar.module.css';

const SIZE_MAP = {
  sm: 32,
  md: 40,
  lg: 56,
} as const;

const FONT_SIZE_MAP = {
  sm: '0.875rem',
  md: '1rem',
  lg: '1.375rem',
} as const;

type Props = {
  profileImageUrl?: string | null;
  nickname: string;
  size?: keyof typeof SIZE_MAP;
};

export default function ProfileAvatar({ profileImageUrl, nickname, size = 'md' }: Props) {
  const px = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];

  return (
    <div className={styles.avatar} style={{ width: px, height: px }}>
      {profileImageUrl ? (
        <img src={profileImageUrl} alt={nickname} className={styles.avatarImg} />
      ) : (
        <span className={styles.avatarInitial} style={{ fontSize }}>
          {nickname.charAt(0)}
        </span>
      )}
    </div>
  );
}
