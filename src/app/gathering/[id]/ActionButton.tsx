'use client';

import React from 'react';
import styles from './roomDetail.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exitGathering, joinGathering } from '@/lib/rooms';
import { useAuth } from '@/contexts/AuthContext';

export function ActionButton({ gatheringId, isJoined, isFull }: { gatheringId: string; isJoined: boolean; isFull: boolean }) {

  const qc = useQueryClient();
  const [toast, setToast] = React.useState<string | null>(null);

  
  const joinMut = useMutation({
    mutationFn: () => joinGathering(gatheringId),
    onSuccess: async () => {
      setToast('참여가 완료되었습니다.');
      await qc.invalidateQueries({ queryKey: ['gathering', gatheringId] });
    },
  });
  const exitMut = useMutation({
    mutationFn: () => exitGathering(gatheringId),
    onSuccess: async () => {
      setToast('참여가 취소되었습니다.');
      await qc.invalidateQueries({ queryKey: ['gathering', gatheringId] });
    },
  });

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  let content: React.ReactNode;
  if (isFull && !isJoined) {
    content = (
      <button className={styles.fullButton} disabled>
        참여 마감
      </button>
    );
  } else if (isJoined) {
    content = (
      <button className={styles.cancelButton} onClick={() => exitMut.mutate()} disabled={exitMut.isPending}>
        참여 취소
      </button>
    );
  } else {
    content = (
      <button
        className={styles.joinButton}
        onClick={() => {
          console.log("CLICKED JOIN BUTTON");
          console.log("Before mutate:", joinMut);
          joinMut.mutate();
          console.log("After mutate call");
        }}
        disabled={joinMut.isPending}
      >
        참여하기
      </button>
    )
  }

  return (
    <div className={styles.actionWrap}>
      {toast && <div className={styles.toast}>{toast}</div>}
      {content}
    </div>
  );
}

