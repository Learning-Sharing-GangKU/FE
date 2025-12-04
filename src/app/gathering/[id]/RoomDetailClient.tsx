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

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  /** "gath_1" 형태 그대로 FE에서 넘겨옴 */
  const gatheringId = params.id;

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

        <div
          className={styles.moreButton}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MoreHorizontal size={26} />
        </div>

        {menuOpen && (
          <div className={styles.menuPopup} ref={menuRef}>
            {isHost ? (
              <>
                <button
                  className={styles.menuItem}
                  onClick={() => router.push(`/gathering/${gatheringId}/edit`)}
                >
                  모임 수정
                </button>
                <button
                  className={styles.menuItemDelete}
                  onClick={() => setShowDeleteModal(true)}
                >
                  모임 삭제
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.menuItem}
                  onClick={() => alert('신고 기능은 준비 중입니다.')}
                >
                  신고하기
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 삭제 모달 */}
      {showDeleteModal && (
        <DeleteGatheringModal
          gatheringId={gatheringId}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {/* =========================
        1. 대표 이미지
       ========================= */}
      <RoomImage src={data.imageUrl} alt="모임 이미지" />

      <div className={styles.divider} />

      {/* =========================
        2. 카테고리 태그
       ========================= */}
      <CategoryTag label={data.category} />

      {/* =========================
        3. 모임 제목
       ========================= */}
      <RoomTitle title={data.title} />

      {/* =========================
        4. 모임 소개 (더보기/접기 포함)
       ========================= */}
      <RoomDescription description={data.description} />

      {/* =========================
        6. 모임 정보(호스트, 날짜, 장소)
       ========================= */}
      <RoomMeta
        host={data.host}
        date={data.date}
        place={data.location}
        onHostClick={() =>
          router.push(`/profile/${data.host.id}`)
        }
      />

      {/* =========================
        7. 참여 인원
       ========================= */}
      <ParticipantSection
        participants={data.participants}
        capacity={data.capacity}
        onProfileClick={(id: number) => router.push(`/profile/${id}`)}
      />

      {/* =========================
        8. 오픈채팅 링크
       ========================= */}
      <ChatLink
        url={data.openChatUrl}
        visible={isJoined}
      />

      {/* =========================
        10. 참여 성공 메시지 (Toast는 ActionButton 내부에서 처리됨)
       ========================= */}

      {/* =========================
        9,11. 참여하기 버튼 / 참여취소 / 마감
       ========================= */}
      {isHost ? (
        // 13. 호스트용 버튼
        <button
          className={styles.hostEditButton}
          onClick={() => router.push(`/gathering/${gatheringId}/edit`)}
        >
          모임 수정하기
        </button>
      ) : (
        <ActionButton
          gatheringId={gatheringId}
          isJoined={isJoined}
          isFull={isFull}
        />
      )}
    </div>
  );

}
