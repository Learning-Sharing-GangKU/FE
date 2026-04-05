'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Upload, Camera } from 'lucide-react';
import styles from './edit.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import CategorySelectModal from '@/components/CategorySelectModal';
import { useProfileEditForm } from '@/hooks/profile/useProfileEditForm';

export default function ProfileEditPage() {
  const { userId } = useParams<{ userId: string }>();
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const {
    profile,
    isLoading,
    profileImagePreview,
    nickname,
    age,
    gender,
    enrollNumber,
    selectedCategories,
    setSelectedCategories,
    setAge,
    setGender,
    setEnrollNumber,
    nicknameStatusText,
    errors,
    touched,
    touch,
    toast,
    isPending,
    handleNicknameChange,
    handleImageUpload,
    handleSubmit,
  } = useProfileEditForm(userId);

  if (isLoading) return null;

  return (
    <div className={styles.container}>
      <TopNav />

      <main className={styles.main}>
        <h2 className={styles.title}>프로필 수정</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* 이메일 — 수정 불가 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>이메일 (변경 불가)</label>
            <div className={styles.emailRow}>
              <input
                type="text"
                className={styles.inputLocked}
                placeholder="이메일은 변경할 수 없습니다"
                disabled
              />
              <span className={styles.emailDomain}>@konkuk.ac.kr</span>
            </div>
          </div>

          {/* 비밀번호 — 수정 불가 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>비밀번호 (변경 불가)</label>
            <div className={styles.passwordRow}>
              <input
                type="password"
                className={styles.inputLocked}
                placeholder="비밀번호는 변경할 수 없습니다"
                disabled
              />
            </div>
          </div>

          {/* 프로필 이미지 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>프로필 이미지</label>
            <div className={styles.profileRow}>
              <div
                className={styles.profileCircle}
                onClick={() => document.getElementById('profileImageInput')?.click()}
              >
                {profileImagePreview ? (
                  <>
                    <img src={profileImagePreview} alt="프로필" className={styles.profileImg} />
                    <div className={styles.profileOverlay}>
                      <Camera size={24} color="white" />
                    </div>
                  </>
                ) : (
                  <div className={styles.profilePlaceholder}>
                    <Upload size={24} />
                    <span>업로드</span>
                  </div>
                )}
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>
              <div className={styles.profileHint}>
                <p>프로필 사진을 변경할 수 있습니다</p>
                <p>JPG, PNG 파일 (최대 5MB)</p>
              </div>
            </div>
          </div>

          {/* 나이 + 성별 */}
          <div className={styles.grid2}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>나이</label>
              <select
                className={styles.select}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onBlur={() => touch('age')}
              >
                <option value="">나이</option>
                {Array.from({ length: 87 }, (_, i) => i + 14).map((v) => (
                  <option key={v} value={v}>{v}세</option>
                ))}
              </select>
              {touched.age && errors.age && (
                <p className={styles.errorText}>{errors.age}</p>
              )}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>성별</label>
              <select
                className={styles.select}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                onBlur={() => touch('gender')}
              >
                <option value="">성별</option>
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
              </select>
              {touched.gender && errors.gender && (
                <p className={styles.errorText}>{errors.gender}</p>
              )}
            </div>
          </div>

          {/* 학번 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>학번</label>
            <select
              className={styles.select}
              value={enrollNumber}
              onChange={(e) => setEnrollNumber(e.target.value)}
              onBlur={() => touch('enrollNumber')}
            >
              <option value="">학번</option>
              {Array.from({ length: 20 }, (_, i) => 10 + i).map((v) => (
                <option key={v} value={v}>{v}학번</option>
              ))}
            </select>
            {touched.enrollNumber && errors.enrollNumber && (
              <p className={styles.errorText}>{errors.enrollNumber}</p>
            )}
          </div>

          {/* 닉네임 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>닉네임</label>
            <input
              type="text"
              placeholder="닉네임"
              className={styles.input}
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              onBlur={() => touch('nickname')}
            />
            {touched.nickname && errors.nickname && !nicknameStatusText && (
              <p className={styles.errorText}>{errors.nickname}</p>
            )}
            {nicknameStatusText && (
              <p className={styles.errorText}>{nicknameStatusText}</p>
            )}
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
            {errors.categories && (
              <p className={styles.errorText}>{errors.categories}</p>
            )}
          </div>

          <button type="submit" className={styles.submitButton} disabled={isPending}>
            {isPending ? '수정 중...' : '수정 완료'}
          </button>
        </form>
      </main>

      <BottomNav />

      {toast && <div className={styles.toastMessage}>{toast}</div>}

      {showCategoryModal && (
        <CategorySelectModal
          mode="preference"
          initialSelected={selectedCategories}
          onConfirm={(cats) => setSelectedCategories(cats)}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
}
