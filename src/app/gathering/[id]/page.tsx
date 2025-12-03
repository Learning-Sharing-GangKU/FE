'use client';

import React, { useState, useRef, useEffect } from 'react';
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
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import DeleteGatheringModal from '@/components/DeleteGatheringModal';
import { useParams } from "next/navigation";

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  /** "gath_1" 형태 그대로 FE에서 넘겨옴 */
  const { id } = useParams();
  const gatheringId = id as string;  // "gath_1"

  /** localStorage → SSR crash 방지 */
  const [myUserId, setMyUserId] = useState<number | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userId');
      if (stored) setMyUserId(Number(stored));
    }
  }, []);

  /** 상세 조회 */
  const { data, isLoading, error } = useQuery({
    queryKey: ['gathering', gatheringId],
    queryFn: () => getGatheringDetail(gatheringId),
  });

  /** ⋯ 메뉴 */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /** 로딩/에러 */
  if (isLoading) return <div className={styles.pageContainer}>로딩 중...</div>;
  if (error || !data) return <div className={styles.pageContainer}>불러오기 실패</div>;

  const isHost = myUserId !== null && data.host.id === myUserId;
  const isJoined = data.isJoined;
  const isFull = data.participants.length >= data.capacity;

  return (
    <div className={styles.pageContainer}>

      {/* =========================
        헤더 + 더보기 버튼
       ========================= */}
      <div className={styles.headerContainer}>
        <HeaderDetail title="모임 상세" />

        {/* 더보기 버튼 - 호스트일 때만 표시 */}
        {isHost && (
          <div
            className={styles.moreButton}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal size={26} />
          </div>
        )}

        {/* ⋯ 눌렀을 때 표시되는 메뉴 */}
        {menuOpen && (
          <div className={styles.menuPopup} ref={menuRef}>
            <button
              className={styles.menuItemDelete}
              onClick={() => setShowDeleteModal(true)}
            >
              모임 삭제
            </button>
          </div>
        )}
      </div>

      {/* =========================
        삭제 모달
       ========================= */}
      {showDeleteModal && (
        <DeleteGatheringModal
          gatheringId={gatheringId}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {/* =========================
        상세 내용
       ========================= */}
      <RoomImage src={data.imageUrl} alt="모임 이미지" />
      <div className={styles.divider} />

      <CategoryTag label={data.category} />
      <RoomTitle title={data.title} />
      <RoomDescription description={data.description} />

      <RoomMeta
        host={data.host.nickname}
        date={data.date}
        place={data.location}
      />

      <ParticipantSection
        participants={data.participants}
        capacity={data.capacity}
      />

      <ChatLink url={data.openChatUrl} visible={isJoined} />

      {/* =========================
        하단 버튼
       ========================= */}
      {isHost ? (
        /* 호스트일 때 — 참가 버튼 없음 */
        <button
          className={styles.hostEditButton}
          onClick={() => router.push(`/gathering/${gatheringId}/edit`)}
        >
          모임 수정
        </button>
      ) : (
        /* 비호스트 — ActionButton 사용 */
        <ActionButton
          gatheringId={gatheringId}
          isJoined={isJoined}
          isFull={isFull}
        />
      )}
    </div>
  );

}
