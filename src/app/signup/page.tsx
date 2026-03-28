'use client';

import { useState } from 'react';
import { Eye, EyeOff, Upload, Camera } from 'lucide-react';
import styles from './signup.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import CategorySelectModal from '@/components/CategorySelectModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useSignup, useSendEmailVerification, useConfirmEmailVerification } from '@/hooks/auth/useSignup';
import { useImageUpload } from '@/hooks/useImageUpload';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageObjectKey, setProfileImageObjectKey] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailStatusText, setEmailStatusText] = useState('');

  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [enrollNumber, setEnrollNumber] = useState('');

  const { mutate: signupMutate, isPending } = useSignup();
  const { mutate: sendVerification, isPending: isSending } = useSendEmailVerification();
  const { mutate: uploadImage } = useImageUpload();
  const { mutate: confirmVerification, isPending: isConfirming } = useConfirmEmailVerification();

  const handleSendEmail = () => {
    sendVerification(`${emailId}@konkuk.ac.kr`, {
      onSuccess: () => {
        setEmailSent(true);
        setEmailStatusText('메일 발송이 완료되었습니다. 이메일 링크를 클릭하시면 인증이 완료됩니다.');
      },
      onError: (error) => {
        setEmailStatusText(`메일 발송에 실패했습니다. (${error.message})`);
      },
    });
  };
  const handleConfirmEmail = () => {
    confirmVerification(undefined, {
      onSuccess: () => {
        setEmailVerified(true);
        setEmailStatusText('이메일 인증이 완료되었습니다. ✅');
      },
      onError: () => {
        setEmailStatusText('이메일 인증을 완료해주세요. 링크를 클릭한 후 다시 시도해주세요.');
      },
    });
  };

  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    uploadImage(file, {
      onSuccess: ({ objectKey }) => setProfileImageObjectKey(objectKey),
    });
  };

  return (
    <div className={styles.container}>
      <TopNav />

      <main className={styles.main}>
        <h2 className={styles.title}>회원가입</h2>

        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); setShowSignupConfirm(true); }}>
          {/* 이메일 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>이메일</label>
            <div className={styles.emailRow}>
              <input
                type="text"
                placeholder="이메일을 입력하세요"
                className={styles.input}
                value={emailId}
                onChange={(e) => {
                  setEmailId(e.target.value);
                  setEmailSent(false);
                  setEmailVerified(false);
                  setEmailStatusText('');
                }}
              />
              <span className={styles.emailDomain}>@konkuk.ac.kr</span>
              {!emailSent ? (
                <button
                  type="button"
                  className={styles.actionButton}
                  disabled={isSending || !emailId}
                  onClick={handleSendEmail}
                >
                  이메일 발송
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.actionButton}
                  disabled={isConfirming || emailVerified}
                  onClick={handleConfirmEmail}
                >
                  인증 완료 확인
                </button>
              )}
            </div>
            {emailStatusText && (
              <p className={styles.emailVerifiedText}>
                {emailStatusText}
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>비밀번호</label>
            <div className={styles.passwordRow}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className={styles.hint}>영대소문자, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요</p>
          </div>

          {/* 비밀번호 확인 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>비밀번호 확인</label>
            <div className={styles.passwordRow}>
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                placeholder="비밀번호 확인"
                className={styles.input}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* 프로필 이미지 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>프로필 이미지</label>
            <div className={styles.profileRow}>
              <div
                className={styles.profileCircle}
                onClick={() => document.getElementById('imageUpload')?.click()}
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
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImagePreview}
                />
              </div>
              <div className={styles.profileHint}>
                <p>프로필 사진을 등록해주세요</p>
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

          {/* 제출 */}
          <button type="submit" className={styles.submitButton} disabled={isPending || !emailVerified}>
            {isPending ? '처리 중...' : '회원가입 완료'}
          </button>
        </form>
      </main>

      <BottomNav />

      {showCategoryModal && (
        <CategorySelectModal
          mode="preference"
          initialSelected={selectedCategories}
          onConfirm={(cats) => setSelectedCategories(cats)}
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={showSignupConfirm}
        onClose={() => setShowSignupConfirm(false)}
        onConfirm={() => {
          setShowSignupConfirm(false);
          signupMutate({
            email: `${emailId}@konkuk.ac.kr`,
            password,
            nickname,
            age: Number(age),
            gender: gender as 'MALE' | 'FEMALE',
            enrollNumber: Number(enrollNumber),
            preferredCategories: selectedCategories,
            ...(profileImageObjectKey && { profileImageObjectKey }),
          });
        }}
        title="회원 가입을 완료하시겠습니까?"
        confirmText="가입하기"
      />
    </div>
  );
}
