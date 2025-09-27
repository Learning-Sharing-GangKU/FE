'use client'

import {useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useRef, useState } from 'react'
import styles from './login.module.css'

//로그인 유효성 스키마 (기초 검증)
const loginSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 주소를 입력해주세요.' }),
  password: z.string().min(1, { message: '비밀번호를 입력해주세요.' }),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

 
  const accessTokenRef = useRef<string | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  })

  //토스트 표시 함수
  const showToast = (message: string) => {
    setToast({ visible: true, message })
    setTimeout(() => setToast({ visible: false, message: '' }), 3000)
  }

  //로그인 요청 함수
  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                    'Accept': 'application/json',
        },
        credentials: 'include', //refresh 토큰 저장 httpOnly 쿠키용
        body: JSON.stringify({
            email: data.email,
            password: data.password,
      }),
    })

    //실패 시 에러 메시지 추출
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error?.message || '로그인 실패')
      }

      //성공 시 accessToken 추출하여 메모리에 저장
      const { accessToken } = await response.json()
      accessTokenRef.current = accessToken //Access Token을 메모리에 저장

      // 로그인 성공 -> 홈 페이지 이동
      window.location.href = '/home'
    } catch (err: any) {
      showToast(err.message || '로그인 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => history.back()}>
          ←
        </button>
        <div className={styles.title}>로그인</div>
        <div style={{ width: '32px' }} />
      </div>

      <div className={styles.logoWrapper}>
        <div className={styles.gangku}>강쿠</div>
        <div className={styles.circle}>
            <img src="/images/logo.png" alt="로고" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.inputGroup}>
        <input
          type="email"
          placeholder="이메일"
          {...register('email')}
          className={styles.input}
        />
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}

        <input
          type="password"
          placeholder="비밀번호"
          {...register('password')}
          className={styles.input}
        />
        {errors.password && <p className={styles.error}>{errors.password.message}</p>}

        <button type="submit" className={styles.loginButton}>
          로그인
        </button>
      </form>

      <div className={styles.signupText}>
        계정이 없으신가요?
        <span
          className={styles.signupLink}
          onClick={() => (window.location.href = '/signup')}
        >
          회원가입
        </span>
      </div>

      {toast.visible && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#111',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          fontSize: 14,
        }}>
          {toast.message}
        </div>
      )}
    </div>
  )
}