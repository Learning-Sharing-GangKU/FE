'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './login.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import ConfirmModal from '@/components/ConfirmModal';
import Link from 'next/link';
import { useLogin } from '@/hooks/auth/useLogin';

function LoginContent() {
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
    <>
      <main className={styles.main}>
        <div className={styles.inner}>
          <div className={styles.logoWrapper}>
            <div className={styles.logoEmoji}>🎓</div>
          </div>

          <h1 className={styles.title}>로그인</h1>

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

          <div className={styles.signupText}>
            <span>계정이 없으신가요? </span>
            <Link href="/signup" className={styles.signupLink}>회원가입</Link>
          </div>
        </div>
      </main>

      <AuthRequiredModal
        isOpen={showUnauthorizedModal}
        onClose={() => setShowUnauthorizedModal(false)}
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
    </>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <TopNav />
      {/* useSearchParams를 사용하는 컴포넌트는 Suspense로 감싸야 빌드됩니다 */}
      <Suspense fallback={<div style={{ padding: '80px 20px', textAlign: 'center' }}>로딩 중...</div>}>
        <LoginContent />
      </Suspense>
      <BottomNav />
    </div>
  );
}
