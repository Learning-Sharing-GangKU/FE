// src/app/gathering/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessToken } from '@/lib/auth';
import styles from './detail.module.css';

export default function GatheringDetailPage({ params }: { params: { id: string } }) {
  const { id: gatheringId } = params;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchGathering = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`/api/v1/gatherings/${gatheringId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          if (res.status === 401) router.push('/login');
          else if (res.status === 404) setError('존재하지 않는 모임입니다.');
          else setError('오류가 발생했습니다.');
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError('요청 중 오류가 발생했습니다.');
      }
    };

    fetchGathering();
  }, [gatheringId]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{data.title}</h1>
      <img className={styles.image} src={data.imageUrl} alt="모임 이미지" />
      <p className={styles.category}>카테고리: {data.category}</p>
      <p className={styles.description}>{data.description}</p>
      <p className={styles.meta}>호스트: {data.host.nickname}</p>
      <p className={styles.meta}>날짜: {new Date(data.date).toLocaleDateString()}</p>
      <p className={styles.meta}>장소: {data.location}</p>
      <p className={styles.meta}>참여 인원: {data.participantsPreview.data.length} / {data.capacity}</p>
      <a className={styles.chatLink} href={data.openChatUrl}>오픈채팅방</a>
    </div>
  );
}