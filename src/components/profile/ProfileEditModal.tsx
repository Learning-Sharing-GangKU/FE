'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import styles from './ProfileEditModal.module.css';
import type { UserProfile } from '@/types/user';
import CategorySelectModal from '@/components/CategorySelectModal';
import ImageUpload from '@/components/ImageUpload';

type Props = {
  profile: UserProfile;
  onClose: () => void;
  onSubmit: () => void;
};

export default function ProfileEditModal({ profile, onClose, onSubmit }: Props) {
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    profile.profileImageUrl ?? null
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    profile.preferredCategories
  );
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // TODO: src/hooks에서 폼 핸들러 및 제출 로직 주입 예정

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.backdrop} onClick={onClose} />
        <div className={styles.modal}>
          {/* 헤더 */}
          <div className={styles.header}>
            <h2 className={styles.title}>프로필 수정</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* 폼 */}
          <div className={styles.body}>
            {/* 프로필 이미지 */}
            <ImageUpload
              label="프로필 이미지"
              imageUrl={profileImagePreview}
              onImageChange={(_, url) => setProfileImagePreview(url)}
              description="프로필 사진을 변경해주세요"
            />

            {/* 나이 + 성별 */}
            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>나이</label>
                <select className={styles.select} defaultValue={profile.age}>
                  <option value="">나이</option>
                  {Array.from({ length: 87 }, (_, i) => i + 14).map((v) => (
                    <option key={v} value={v}>{v}세</option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>성별</label>
                <select className={styles.select} defaultValue={profile.gender}>
                  <option value="">성별</option>
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              </div>
            </div>

            {/* 학번 */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>학번</label>
              <select className={styles.select} defaultValue={profile.enrollNumber}>
                <option value="">학번</option>
                {Array.from({ length: 20 }, (_, i) => 10 + i).map((v) => (
                  <option key={v} value={v}>{v}학번</option>
                ))}
              </select>
            </div>

            {/* 닉네임 */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>닉네임</label>
              <input
                type="text"
                defaultValue={profile.nickname}
                className={styles.input}
              />
            </div>

            {/* 선호 카테고리 */}
            <div className={styles.fieldGroup}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setShowCategoryModal(true)}
              >
                {selectedCategories.length > 0
                  ? `선호 카테고리 선택 (${selectedCategories.length}/3)`
                  : '선호 카테고리 선택'}
              </button>
              {selectedCategories.length > 0 && (
                <div className={styles.selectedTags}>
                  {selectedCategories.map((cat) => (
                    <div key={cat} className={styles.tag}>
                      <span>{cat}</span>
                      <button
                        type="button"
                        className={styles.tagRemove}
                        onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== cat))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 제출 */}
            <button className={styles.submitButton} onClick={onSubmit}>
              수정 완료
            </button>
          </div>
        </div>
      </div>

      {showCategoryModal && (
        <CategorySelectModal
          mode="preference"
          initialSelected={selectedCategories}
          onConfirm={(cats) => setSelectedCategories(cats)}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </>
  );
}
