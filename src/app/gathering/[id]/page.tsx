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
import { useParams } from 'next/navigation';
import { useGatheringDetail } from '@/hooks/gathering/useGatheringDetail';

const ITEMS_PER_PAGE = 5;

export default function GatheringDetailPage() {
  const params = useParams();
  const gatheringId = params.id as string;
  const { data: gathering, isLoading } = useGatheringDetail(gatheringId);

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCancelJoinModal, setShowCancelJoinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (isLoading || !gathering) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>모임 정보를 불러오는 중...</div>
      </div>
    );
  }

  const totalPages = Math.ceil(gathering.participants.length / ITEMS_PER_PAGE);
  const pageParticipants = gathering.participants.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <Link href="/home" className={styles.backButton}>
              <ArrowLeft size={24} />
            </Link>
            <h1 className={styles.headerTitle}>GangKU 🎓</h1>
          </div>

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
                  <button className={styles.menuItem} onClick={() => setMenuOpen(false)}>
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
        </div>
      </header>

      <main className={styles.main}>
        {/* 메인 카드 */}
        <div className={styles.card}>
          {/* 이미지 */}
          <div className={styles.imageWrapper}>
            <img
              src={gathering.imageUrl ?? '/images/logo.png'}
              alt={gathering.title}
              className={styles.image}
            />
          </div>

          {/* 콘텐츠 */}
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
              <span>{gathering.date}</span>
              <span className={styles.dot}>·</span>
              <span>호스트: {gathering.host.nickname}</span>
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
            {/* 페이지 인디케이터 */}
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
              {pageParticipants.map((p) => (
                <div key={p.userId} className={styles.participantItem}>
                  <img
                    src={p.profileImageUrl ?? '/images/logo.png'}
                    alt={p.nickname}
                    className={styles.participantAvatar}
                  />
                  <span className={styles.participantName}>{p.nickname}</span>
                </div>
              ))}
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
        {gathering.openChatUrl && (
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

        {/* 참여 / 참여 취소 버튼 */}
        {gathering.isJoined ? (
          <button className={styles.joinButton} onClick={() => setShowCancelJoinModal(true)}>
            참여 취소하기
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
        onConfirm={() => { setShowJoinModal(false); }}
        title="모임에 참여하시겠습니까?"
        confirmText="참여하기"
        description="모임 참여 후 활동을 시작할 수 있습니다."
      />
      <ConfirmModal
        isOpen={showCancelJoinModal}
        onClose={() => setShowCancelJoinModal(false)}
        onConfirm={() => { setShowCancelJoinModal(false); }}
        title="모임 참여를 취소하시겠습니까?"
        confirmText="취소하기"
        description="참여 취소 시 다시 신청해야 합니다."
      />
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => { setShowDeleteModal(false); }}
        title="모임을 삭제하시겠습니까?"
        confirmText="삭제하기"
        description="삭제된 모임은 복구할 수 없습니다."
      />
    </div>
  );
}
