'use client';

import { useState } from 'react';
import styles from './login.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { useLogin } from '@/hooks/auth/useLogin';

export default function LoginPage() {
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: loginMutate, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutate({ email: `${emailId}@konkuk.ac.kr`, password });
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
    </div>
  );
}
