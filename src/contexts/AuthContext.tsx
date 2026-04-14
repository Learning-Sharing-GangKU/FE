'use client';

import React, { useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
axios.defaults.withCredentials = true;

import {
  getAccessToken,
} from '@/lib/auth';
import { logout as logoutApi, reissueToken } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

export const InitialAuthContext = createContext<boolean>(false);

export const AuthProvider = ({ children, initialIsLoggedIn = false }: { children: React.ReactNode, initialIsLoggedIn?: boolean }) => {
  const router = useRouter();
  const { login, setFromToken, clearAuth, logout: storeLogout } = useAuthStore();

  // 컴포넌트 마운트 시 최초 1회만 쿠키와 로컬 스토리지 상태 동기화
  useEffect(() => {
    const existingToken = getAccessToken();
    if (existingToken) {
      setFromToken(existingToken);
    } else {
      // 컴포넌트 마운트 시 토큰이 없다면 1회 재발급 시도 (원한다면 유지)
      reissueToken().then((res) => {
        if (res.accessToken) setFromToken(res.accessToken);
        else useAuthStore.getState().clearAuth();
      }).catch(() => {
        useAuthStore.getState().clearAuth();
      });
    }
  }, []);

  return <InitialAuthContext.Provider value={initialIsLoggedIn}>{children}</InitialAuthContext.Provider>;
};

// 하위 호환성 유지
export const useAuth = () => {
  const storeAuth = useAuthStore();
  const initialIsLoggedIn = useContext(InitialAuthContext);
  const router = useRouter();

  // If the store hasn't initialized from the client yet (null), we fallback to the SSR truth
  const isLoggedIn = storeAuth.isLoggedIn === null ? initialIsLoggedIn : storeAuth.isLoggedIn;
// Remove duplicate router

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('로그아웃 API 요청 실패:', err);
    } finally {
      useAuthStore.getState().logout();
      window.location.href = '/home';
    }
  };

  const login = (token: string) => {
    useAuthStore.getState().login(token);
  };

  return { isLoggedIn, myUserId: storeAuth.myUserId, login, logout };
};
