'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from '@/lib/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ 새로고침 시 로그인 상태 복원
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const token = getAccessToken();

        if (token) {
          // AccessToken이 localStorage에 있으면 우선 로그인 상태 유지
          setIsLoggedIn(true);
        } else {
          // AccessToken 없으면 refresh_token 쿠키로 재발급 시도
          const res = await axios.post(
            '/api/v1/auth/reissue',
            {},
            { withCredentials: true } // ✅ 쿠키 포함
          );

          if (res.data.accessToken) {
            setAccessToken(res.data.accessToken);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        }
      } catch (err) {
        console.warn('자동 로그인 복원 실패:', err);
        setIsLoggedIn(false);
      }
    };

    restoreAuth();
  }, []);

  // ✅ 로그인 시 AccessToken 저장
  const login = (token: string) => {
    setAccessToken(token);
    setIsLoggedIn(true);
  };

  // ✅ 로그아웃 시 AccessToken 제거 + 서버 로그아웃 요청
  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include', 
      });
    } catch (err) {
      console.error('로그아웃 API 요청 실패:', err);
    } finally {
      removeAccessToken();
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth must be used within an AuthProvider');
  return context;
};