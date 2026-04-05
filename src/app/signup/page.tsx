'use client';

import { useState } from 'react';
import { Eye, EyeOff, Upload, Camera } from 'lucide-react';
import styles from './signup.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import CategorySelectModal from '@/components/CategorySelectModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useSignupForm } from '@/hooks/auth/useSignupForm';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  const {
    emailId,
    password,
    passwordConfirm,
    nickname,
    age,
    gender,
    enrollNumber,
    selectedCategories,
    setSelectedCategories,
    setPassword,
    setPasswordConfirm,
    setAge,
    setGender,
    setEnrollNumber,
    emailSent,
    emailVerified,
    emailStatusText,
    isEmailDuplicate,
    nicknameStatusText,
    errors,
    isFormValid,
    touched,
    touch,
    isPending,
    isSending,
    isConfirming,
    handleEmailIdChange,
    handleNicknameChange,
    handleSendEmail,
    handleConfirmEmail,
    handleImageUpload,
    handleConfirmSignup,
  } = useSignupForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setShowSignupConfirm(true);
  };

  return (
    <div className={styles.container}>
      <TopNav />

      <main className={styles.main}>
        <h2 className={styles.title}>회원가입</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* 이메일 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>이메일</label>
            <div className={styles.emailRow}>
              <input
                type="text"
                placeholder="이메일을 입력하세요"
                className={styles.input}
                value={emailId}
                onChange={(e) => handleEmailIdChange(e.target.value)}
                onBlur={() => touch('email')}
              />
              <span className={styles.emailDomain}>@konkuk.ac.kr</span>
              <button
                type="button"
                className={styles.actionButton}
                disabled={isSending || !emailId || emailSent}
                onClick={handleSendEmail}
              >
                이메일 발송
              </button>
            </div>

            {emailSent && !emailVerified && (
              <button
                type="button"
                className={styles.actionButton}
                disabled={isConfirming}
                onClick={handleConfirmEmail}
              >
                {isConfirming ? '확인 중...' : '인증 완료 확인'}
              </button>
            )}
            {emailStatusText && (
              <p className={styles.emailVerifiedText}>{emailStatusText}</p>
            )}
            {touched.email && errors.email && !isEmailDuplicate && !emailStatusText && (
              <p className={styles.errorText}>{errors.email}</p>
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
                onBlur={() => touch('password')}
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
            {touched.password && errors.password && (
              <p className={styles.errorText}>{errors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>비밀번호 확인</label>
            <div className={styles.passwordRow}>
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                placeholder="비밀번호 확인"
                className={styles.input}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                onBlur={() => touch('passwordConfirm')}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {touched.passwordConfirm && errors.passwordConfirm && (
              <p className={styles.errorText}>{errors.passwordConfirm}</p>
            )}
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, setProfileImagePreview);
                  }}
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

          {/* 제출 */}
          <button type="submit" className={styles.submitButton} disabled={isPending || !isFormValid}>
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
          handleConfirmSignup();
        }}
        title="회원 가입을 완료하시겠습니까?"
        confirmText="가입하기"
      />
    </div>
  );
}
