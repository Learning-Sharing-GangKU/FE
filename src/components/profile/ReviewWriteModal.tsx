'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import styles from './ReviewWriteModal.module.css';
import type { UserSummary } from '@/types/user';
import ConfirmModal from '@/components/ConfirmModal';
import ProfileAvatar from '@/components/ProfileAvatar';

interface ReviewWriteModalProps {
  targetUser: UserSummary;
  onClose: () => void;
  onSubmit: (rating: number, content: string) => void;
}

const MAX_LENGTH = 100;

export default function ReviewWriteModal({ targetUser, onClose, onSubmit }: ReviewWriteModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmitClick = () => {
    if (rating === 0 || content.trim().length === 0) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onSubmit(rating, content);
    setShowConfirm(false);
    onClose();
  };

  return (
    <>
      {/* 메인 모달 */}
      <div className={styles.overlay}>
        <div className={styles.modal}>
          {/* 헤더 */}
          <div className={styles.modalHeader}>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
            <h2 className={styles.modalTitle}>리뷰 작성</h2>
            <div className={styles.modalSpacer} />
          </div>

          {/* 본문 */}
          <div className={styles.modalBody}>
            {/* 유저 정보 */}
            <div className={styles.userRow}>
              <ProfileAvatar
                profileImageUrl={targetUser.profileImageUrl}
                nickname={targetUser.nickname}
                size="md"
              />
              <div className={styles.userInfo}>
                <h3 className={styles.userName}>{targetUser.nickname}</h3>
                <p className={styles.userMeta}>
                  {targetUser.age}세 · {targetUser.enrollNumber}학번 · {targetUser.gender === 'MALE' ? '남' : '여'}
                </p>
                {targetUser.preferredCategories.length > 0 && (
                  <div className={styles.userTags}>
                    {targetUser.preferredCategories.map((cat, i) => (
                      <span key={i} className={styles.userTag}>{cat}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 별점 */}
            <div className={styles.ratingSection}>
              <label className={styles.ratingLabel}>별점</label>
              <div className={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={styles.starButton}
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      size={40}
                      className={value <= (hoveredRating || rating) ? styles.starFilled : styles.starEmpty}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className={styles.ratingText}>
                  선택한 별점: <span className={styles.ratingValue}>{rating}점</span>
                </p>
              )}
            </div>

            {/* 리뷰 내용 */}
            <div className={styles.textareaSection}>
              <label className={styles.textareaLabel}>리뷰 내용</label>
              <textarea
                className={styles.textarea}
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_LENGTH) setContent(e.target.value);
                }}
                placeholder="자세한 리뷰를 작성해주세요"
              />
              <div className={styles.textareaFooter}>
                <p className={styles.textareaHint}>리뷰 내용은 최대 100자까지 작성가능합니다.</p>
                <span className={`${styles.charCount} ${content.length >= MAX_LENGTH ? styles.charCountMax : ''}`}>
                  {content.length}/{MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* 안내 */}
            <div className={styles.notice}>
              <p className={styles.noticeText}>
                호스트가 모임을 종료하고, 같은 모임에 참여한 유저만 작성할 수 있습니다.
              </p>
            </div>

            {/* 완료 버튼 */}
            <button
              className={styles.submitButton}
              onClick={handleSubmitClick}
              disabled={rating === 0 || content.trim().length === 0}
            >
              완료
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="모임에 대한 리뷰를 작성합니다."
        confirmText="리뷰 작성"
        description="리뷰를 작성하면 수정할 수 없습니다."
      />
    </>
  );
}
