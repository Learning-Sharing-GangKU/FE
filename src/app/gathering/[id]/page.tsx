'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGatheringDetail } from '@/lib/rooms';
import {
  HeaderDetail,
  RoomImage,
  CategoryTag,
  RoomTitle,
  RoomDescription,
  RoomMeta,
  ParticipantSection,
  ChatLink,
  ActionButton,
} from './index';
import styles from './roomDetail.module.css';

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {

  // ❗ Promise를 React.use 로 언래핑해야 함
  const { id } = React.use(params); 
  const gatheringId = id; // "gath_1" 이런 형태로 들어옴
  const { data, isLoading, error } = useQuery({
    queryKey: ['gathering', gatheringId],
    queryFn: () => getGatheringDetail(gatheringId),
  });

  if (isLoading) return <div className={styles.pageContainer}>로딩 중...</div>;
  if (error || !data) return <div className={styles.pageContainer}>불러오기 실패</div>;

  const participants = Array.isArray(data.participants) ? data.participants : [];
  const capacity = typeof data.capacity === 'number' ? data.capacity : 0;
  const myUserId = Number(localStorage.getItem('userId'));
  const isJoined = participants.some(p => p.userId === myUserId);
  const isFull = participants.length >= capacity;
  const showChat = isJoined; // 참여자에게만 노출

  console.log("isJoined =", data.isJoined);
  console.log("participants =", data.participants);
  console.log("myUserId =", localStorage.getItem('userId'));
  return (
    <div className={styles.pageContainer}>
      <HeaderDetail title="모임 상세" />
      <RoomImage src={data.imageUrl} alt="모임 이미지" />
      <div className={styles.divider} />
      <CategoryTag label={data.category} />
      <RoomTitle title={data.title} />
      <RoomDescription description={data.description} />
      <RoomMeta host={data.host.nickname} date={data.date} place={data.location} />
      <ParticipantSection participants={participants} capacity={capacity} />
      <ChatLink url={data.openChatUrl} visible={showChat} />
      <ActionButton gatheringId={gatheringId} isJoined={isJoined} isFull={isFull} />
    </div>
  );
}