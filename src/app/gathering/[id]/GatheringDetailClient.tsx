'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  User,
  Calendar,
  MapPin,
  Tag,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from 'lucide-react';
import styles from './roomDetail.module.css';
import BottomNav from '@/components/BottomNav';
import ConfirmModal from '@/components/ConfirmModal';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useGatheringDetail } from '@/hooks/gathering/useGatheringDetail';
import { useDeleteGathering } from '@/hooks/gathering/useDeleteGathering';
import ProfileAvatar from '@/components/ProfileAvatar';
import { useQueryClient } from '@tanstack/react-query';
import { joinGathering, exitGathering, finishGathering } from '@/api/gathering';
import GatheringFailedModal from '@/components/gathering/GatheringFailedModal';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

const ITEMS_PER_PAGE = 5;

function formatGatheringDate(dateString: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dateString));
}

export default function GatheringDetailClient() {
  const params = useParams();
  const router = useRouter();
  const gatheringId = params.id as string;
  const queryClient = useQueryClient();
  // SSR에서 미리 채워진 데이터를 즉시 가져옴 (isLoading=false로 시작)
  const { data: gathering } = useGatheringDetail(gatheringId);
  const { mutate: deleteGathering } = useDeleteGathering();

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCancelJoinModal, setShowCancelJoinModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { myUserId } = useAuthStore();

  if (!gathering) return null;

  const totalPages = Math.ceil(gathering.participants.length / ITEMS_PER_PAGE);
  const pageParticipants = gathering.participants.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const isHost =
    myUserId === String(gathering.host.id) ||
    myUserId === `usr_${gathering.host.id}`;

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <Link href="/home" className={styles.backButton}>
              <ArrowLeft size={24} />
            </Link>
            <Link href="/home" className={styles.headerTitleLink} aria-label="홈으로 이동">
              <h1 className={styles.headerTitle}>GangKU 🎓</h1>
            </Link>
          </div>

          {isHost && (
            <div className={styles.menuWrapper}>
              <button
                className={styles.moreButton}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <MoreVertical size={24} />
              </button>

              {menuOpen && (
                <>
                  <div className={styles.menuBackdrop} onClick={() => setMenuOpen(false)} />
                  <div className={styles.menuPopup}>
                    <button className={styles.menuItem} onClick={() => { setMenuOpen(false); router.push(`/gathering/${gatheringId}/edit`); }}>
                      <Edit size={16} />
                      모임 수정
                    </button>
                    <button className={`${styles.menuItem} ${styles.menuItemDelete}`} onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }}>
                      <Trash2 size={16} />
                      모임 삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {/* 메인 카드 */}
        <div className={styles.card}>
          <div className={styles.imageWrapper}>
            <img
              src={gathering.imageUrl ?? '/images/logo.png'}
              alt={gathering.title}
              className={styles.image}
            />
          </div>

          <div className={styles.cardContent}>
            <h2 className={styles.title}>{gathering.title}</h2>
            <p className={styles.description}>{gathering.description}</p>

            <div className={styles.metaList}>
              <div className={styles.metaItem}>
                <User size={16} className={styles.metaIcon} />
                <span>{gathering.participants.length}명 참여중</span>
              </div>
              <div className={styles.metaItem}>
                <MapPin size={16} className={styles.metaIcon} />
                <span>{gathering.location}</span>
              </div>
              <div className={styles.metaItem}>
                <Tag size={16} className={styles.metaIcon} />
                <span>{gathering.category}</span>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.metaItem}>
              <Calendar size={16} className={styles.metaIcon} />
              <span>{formatGatheringDate(gathering.date)}</span>
              <Link 
                href={`/profile/${String(gathering.host.id).startsWith('usr_') ? gathering.host.id : `usr_${gathering.host.id}`}`}
                style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
              >
                호스트: {gathering.host.nickname}
              </Link>
            </div>
          </div>
        </div>

        {/* 참여 인원 카드 */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              참여 인원
              <span className={styles.sectionCount}>
                ({gathering.participants.length}/{gathering.capacity})
              </span>
            </h3>
            <div className={styles.pageIndicators}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <div
                  key={i}
                  className={`${styles.indicator} ${i === currentPage ? styles.indicatorActive : ''}`}
                />
              ))}
            </div>
          </div>

          <div className={styles.participantRow}>
            <button
              className={styles.navButton}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft size={20} />
            </button>

            <div className={styles.participantGrid}>
              {pageParticipants.map((p) => {
                const uid = String(p.userId).startsWith('usr_') ? p.userId : `usr_${p.userId}`;
                return (
                  <Link href={`/profile/${uid}`} key={p.userId} className={styles.participantItem}>
                    <ProfileAvatar
                      profileImageUrl={p.profileImageUrl}
                      nickname={p.nickname}
                      size="sm"
                    />
                    <span className={styles.participantName}>{p.nickname}</span>
                  </Link>
                );
              })}
            </div>

            <button
              className={styles.navButton}
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* 채팅방 링크 카드 */}
        {gathering.joined && gathering.openChatUrl && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>모임 대화방 링크</h3>
            <div className={styles.chatRow}>
              <input
                type="text"
                value={gathering.openChatUrl}
                readOnly
                className={styles.chatInput}
              />
              <button
                className={styles.copyButton}
                onClick={() => navigator.clipboard.writeText(gathering.openChatUrl ?? '')}
              >
                복사
              </button>
            </div>
          </div>
        )}

        {/* 참여 / 참여 취소 / 모임 종료 버튼 */}
        {gathering.status === 'FINISHED' ? (
          <button className={`${styles.joinButton} ${styles.disabledButton}`} disabled>
            종료된 모임입니다
          </button>
        ) : isHost ? (
          <button className={styles.joinButton} onClick={() => {
            const gatheringDate = new Date(gathering.date);
            if (new Date() < gatheringDate) {
              setFailedMessage('모임 예정일이 지나야 모임을 종료할 수 있습니다.');
              return;
            }
            setShowFinishModal(true);
          }}>
            모임 종료
          </button>
        ) : gathering.joined ? (
          <button className={styles.joinButton} onClick={() => setShowCancelJoinModal(true)}>
            참여 취소하기
          </button>
        ) : gathering.status === 'FULL' || gathering.participants.length >= gathering.capacity ? (
          <button className={`${styles.joinButton} ${styles.disabledButton}`} disabled>
            모집 완료
          </button>
        ) : (
          <button className={styles.joinButton} onClick={() => setShowJoinModal(true)}>
            모임 참여하기
          </button>
        )}
      </main>

      <BottomNav />

      <ConfirmModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onConfirm={async () => {
          try {
            await joinGathering(gatheringId);
            queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
            setShowJoinModal(false);
            toast.success('모임에 성공적으로 참여했습니다.');
          } catch (err: any) {
            setShowJoinModal(false);
            toast.error(err.message || '참여 처리에 실패했습니다.');
          }
        }}
        title="모임에 참여하시겠습니까?"
        confirmText="참여하기"
        description="모임 참여 후 활동을 시작할 수 있습니다."
      />
      <ConfirmModal
        isOpen={showCancelJoinModal}
        onClose={() => setShowCancelJoinModal(false)}
        onConfirm={async () => {
          try {
            await exitGathering(gatheringId);
            queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
            setShowCancelJoinModal(false);
            toast.success('일정 참여가 취소되었습니다.');
          } catch (err: any) {
            setShowCancelJoinModal(false);
            toast.error(err.message || '참여 취소에 실패했습니다.');
          }
        }}
        title="모임 참여를 취소하시겠습니까?"
        confirmText="취소하기"
        description="참여 취소 시 다시 신청해야 합니다."
      />
      <ConfirmModal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={async () => {
          try {
            await finishGathering(gatheringId);
            queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
            setShowFinishModal(false);
            router.push('/home');
            toast.success('모임이 종료되었습니다.');
          } catch (err: any) {
            setShowFinishModal(false);
            toast.error(err.message || '모임 종료에 실패했습니다.');
          }
        }}
        title="모임을 종료하시겠습니까?"
        confirmText="종료하기"
        cancelText="취소"
        description="모임이 종료되면 더 이상 참가할 수 없습니다."
      />

      {failedMessage && (
        <GatheringFailedModal
          title="모임 종료 불가"
          message={failedMessage}
          onClose={() => setFailedMessage(null)}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          deleteGathering(gatheringId, { onSuccess: () => router.push('/home') });
        }}
        title="모임을 삭제하시겠습니까?"
        confirmText="삭제하기"
        description="삭제된 모임은 복구할 수 없습니다."
      />
    </div>
  );
}
