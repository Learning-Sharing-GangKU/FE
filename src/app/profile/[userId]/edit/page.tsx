'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Upload, Camera } from 'lucide-react';
import styles from './edit.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import CategorySelectModal from '@/components/CategorySelectModal';
import { useProfile } from '@/hooks/profile/useProfile';
import { useUpdateProfile } from '@/hooks/profile/useUpdateProfile';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/useToast';
import type { UpdateProfilePayload } from '@/types/user';

export default function ProfileEditPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { profile, isLoading } = useProfile(userId);
  const { mutate: updateProfile, isPending } = useUpdateProfile(userId);
  const { mutate: uploadImage } = useImageUpload();
  const { toast, showToast } = useToast();

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageObjectKey, setProfileImageObjectKey] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [enrollNumber, setEnrollNumber] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // 프로필 데이터 로드 후 폼 초기값 세팅
  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname);
    setAge(String(profile.age));
    setGender(profile.gender);
    setEnrollNumber(String(profile.enrollNumber));
    setSelectedCategories(profile.preferredCategories);
    setProfileImagePreview(profile.profileImageUrl ?? null);
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    uploadImage(file, {
      onSuccess: ({ objectKey }) => setProfileImageObjectKey(objectKey),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const payload: UpdateProfilePayload = {};

    if (nickname !== profile.nickname) payload.nickname = nickname;
    if (Number(age) !== profile.age) payload.age = Number(age);
    if (gender !== profile.gender) payload.gender = gender as UpdateProfilePayload['gender'];
    if (Number(enrollNumber) !== profile.enrollNumber) payload.enrollNumber = Number(enrollNumber);
    if (JSON.stringify(selectedCategories) !== JSON.stringify(profile.preferredCategories))
      payload.preferredCategories = selectedCategories;

    if (profileImageObjectKey) payload.profileImageObjectKey = profileImageObjectKey;

    if (Object.keys(payload).length === 0) {
      showToast('변경된 내용이 없습니다.');
      return;
    }
    
    updateProfile(payload, {
      onSuccess: () => router.push(`/profile/${userId}`),
      onError: () => showToast('수정에 실패했습니다.'),
    });
  };

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
                  onChange={handleImageChange}
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
              <select className={styles.select} value={age} onChange={(e) => setAge(e.target.value)}>
                <option value="">나이</option>
                {Array.from({ length: 87 }, (_, i) => i + 14).map((v) => (
                  <option key={v} value={v}>{v}세</option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>성별</label>
              <select className={styles.select} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">성별</option>
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
              </select>
            </div>
          </div>

          {/* 학번 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>학번</label>
            <select className={styles.select} value={enrollNumber} onChange={(e) => setEnrollNumber(e.target.value)}>
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
              placeholder="닉네임"
              className={styles.input}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
