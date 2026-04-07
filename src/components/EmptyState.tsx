'use client';

import { LucideIcon, Users, MessageSquare, CalendarPlus, CalendarCheck } from 'lucide-react';
import styles from './EmptyState.module.css';

export type EmptyStateType =
  | 'no-meetings'
  | 'no-reviews'
  | 'no-created-meetings'
  | 'no-joined-meetings';

const config: Record<EmptyStateType, { icon: LucideIcon; title: string; description: string }> = {
  'no-meetings': {
    icon: Users,
    title: '모임이 없습니다',
    description: '아직 참여 가능한 모임이 없어요.\n새로운 모임을 만들어보세요!',
  },
  'no-reviews': {
    icon: MessageSquare,
    title: '리뷰가 없습니다',
    description: '아직 작성된 리뷰가 없어요.\n첫 번째 리뷰를 남겨보세요!',
  },
  'no-created-meetings': {
    icon: CalendarPlus,
    title: '만든 모임이 없습니다',
    description: '아직 생성한 모임이 없어요.\n새로운 모임을 만들어보세요!',
  },
  'no-joined-meetings': {
    icon: CalendarCheck,
    title: '참여한 모임이 없습니다',
    description: '아직 참여한 모임이 없어요.\n관심있는 모임에 참여해보세요!',
  },
};

type Props = {
  type: EmptyStateType;
};

export default function EmptyState({ type }: Props) {
  const { icon: Icon, title, description } = config[type];

  return (
    <div className={styles.wrapper}>
      <div className={styles.iconCircle}>
        <Icon size={48} color="#9ca3af" strokeWidth={1.5} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
