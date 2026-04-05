'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './login.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import ConfirmModal from '@/components/ConfirmModal';
import Link from 'next/link';
import { useLogin } from '@/hooks/auth/useLogin';

export default function LoginPage() {
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [showLoginErrorModal, setShowLoginErrorModal] = useState(false);
  const { mutate: loginMutate, isPending } = useLogin();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('unauthorized') === '1') {
      setShowUnauthorizedModal(true);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutate(
      { email: `${emailId}@konkuk.ac.kr`, password },
      { onError: () => setShowLoginErrorModal(true) }
    );
  };

  return (
    <div className={styles.container}>
      <TopNav />

      <main className={styles.main}>
        <div className={styles.inner}>
          {/* 로고 */}
          <div className={styles.logoWrapper}>
            <div className={styles.logoEmoji}>🎓</div>
          </div>

          {/* 타이틀 */}
          <h1 className={styles.title}>로그인</h1>

          {/* 폼 */}
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.label}>이메일</label>
              <div className={styles.emailRow}>
                <input
                  id="email"
                  type="text"
                  placeholder="아이디"
                  className={styles.input}
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                />
                <span className={styles.emailDomain}>@konkuk.ac.kr</span>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="password" className={styles.label}>비밀번호</label>
              <input
                id="password"
                type="password"
                placeholder="비밀번호"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className={styles.loginButton} disabled={isPending}>
              {isPending ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 회원가입 링크 */}
          <div className={styles.signupText}>
            <span>계정이 없으신가요? </span>
            <Link href="/signup" className={styles.signupLink}>회원가입</Link>
          </div>
        </div>
      </main>
      <BottomNav />

      <ConfirmModal
        isOpen={showUnauthorizedModal}
        onClose={() => setShowUnauthorizedModal(false)}
        onConfirm={() => setShowUnauthorizedModal(false)}
        title="로그인이 필요합니다"
        description="해당 페이지는 로그인 후 이용할 수 있습니다."
        confirmText="확인"
        cancelText={false}
      />

      <ConfirmModal
        isOpen={showLoginErrorModal}
        onClose={() => setShowLoginErrorModal(false)}
        onConfirm={() => setShowLoginErrorModal(false)}
        title="로그인 실패"
        description="이메일 또는 비밀번호가 올바르지 않습니다."
        confirmText="확인"
        cancelText={false}
      />
    </div>
  );
}
