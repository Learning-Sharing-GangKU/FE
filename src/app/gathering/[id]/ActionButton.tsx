'use client';

import React from 'react';
import styles from './roomDetail.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exitGathering, joinGathering } from '@/lib/rooms';
import { getGatheringDetail } from '@/lib/rooms';
import { fetchUserGatherings } from '@/lib/rooms';

export function ActionButton({ gatheringId, isJoined, isFull }: { gatheringId: string; isJoined: boolean; isFull: boolean }) {

  const qc = useQueryClient();
  const [toast, setToast] = React.useState<string | null>(null);
  const joinMut = useMutation({
    mutationFn: () => joinGathering(gatheringId),
    onSuccess: async () => {
      setToast('참여가 완료되었습니다.');

      // 🔥 최신 데이터 직접 다시 요청
      const updatedHostList = await fetchUserGatherings("host");
      const updatedGuestList = await fetchUserGatherings("guest");
      const updatedDetail = await getGatheringDetail(gatheringId);

      // 🔥 React Query 캐시 즉시 업데이트 → UI 즉시 반영
      qc.setQueryData(["myGatherings", "host"], updatedHostList);
      qc.setQueryData(["myGatherings", "guest"], updatedGuestList);
      qc.setQueryData(["gathering", gatheringId], updatedDetail);
    },
  });

  const exitMut = useMutation({
    mutationFn: () => exitGathering(gatheringId),
    onSuccess: async () => {
      setToast('참여가 취소되었습니다.');

      // 🔥 최신 데이터 직접 다시 요청
      const updatedHostList = await fetchUserGatherings("host");
      const updatedGuestList = await fetchUserGatherings("guest");
      const updatedDetail = await getGatheringDetail(gatheringId);

      // 🔥 React Query 캐시 즉시 업데이트 → UI 즉시 반영
      qc.setQueryData(["myGatherings", "host"], updatedHostList);
      qc.setQueryData(["myGatherings", "guest"], updatedGuestList);
      qc.setQueryData(["gathering", gatheringId], updatedDetail);
    },
  });

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  let content: React.ReactNode;

  if (isFull && !isJoined) {
    content = <button className={styles.fullButton} disabled>참여 마감</button>;
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
        onClick={() => joinMut.mutate()}
        disabled={joinMut.isPending}
      >
        참여하기
      </button>
    );
  }

  return (
    <div className={styles.actionWrap}>
      {toast && <div className={styles.toast}>{toast}</div>}
      {content}
    </div>
  );
}