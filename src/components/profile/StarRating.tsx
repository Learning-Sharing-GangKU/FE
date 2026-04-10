'use client';

import { Star } from 'lucide-react';
import styles from '@/app/profile/profile.module.css';

type Props = {
  rating: number;
  size?: number;
};

/**
 * 소수점 평점을 정확히 비율로 반영하는 별점 컴포넌트
 * 예) 3.3점 → 66% 채워짐, 3.7점 → 74% 채워짐
 *
 * 구조:
 * - 배경(회색) 별 5개 위에
 * - 노란 채워진 별 5개를 (rating / 5 * 100)% 너비로 클리핑해서 오버레이
 */
export default function StarRating({ rating, size = 16 }: Props) {
  const fillPercent = Math.max(0, Math.min(100, (rating / 5) * 100));

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {/* 배경: 비어있는 회색 별 5개 */}
      <div style={{ display: 'flex' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={size} className={styles.starEmpty} />
        ))}
      </div>

      {/* 오버레이: 노란 채워진 별 5개를 rating 비율만큼만 보이게 클리핑 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'flex',
          overflow: 'hidden',
          width: `${fillPercent}%`,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={size} className={styles.starFilled} />
        ))}
      </div>
    </div>
  );
}
