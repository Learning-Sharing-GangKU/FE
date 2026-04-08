'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
axios.defaults.withCredentials = true;

import {
  getAccessToken,
  isTokenExpiredOrNearExpiry,
} from '@/lib/auth';
import { logout as logoutApi } from '@/api/auth';
import { useAuthStore, getUserIdFromToken } from '@/stores/authStore';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { login, setFromToken, clearAuth, logout: storeLogout } = useAuthStore();

  const reissueIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isReissuingRef = useRef(false);

  // 토큰 재발급
  const reissueToken = useCallback(
    async (forceLogoutOnFailure = false): Promise<boolean> => {
      if (isReissuingRef.current) return false;
      try {
        isReissuingRef.current = true;
        const res = await axios.post('/api/v1/auth/reissue', {}, { withCredentials: true });
        if (res.data?.accessToken) {
          setFromToken(res.data.accessToken);
          return true;
        }
        if (forceLogoutOnFailure) clearAuth();
        return false;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status !== 400 && status !== 401) {
          console.warn('토큰 재발급 실패:', err);
        }
        if (forceLogoutOnFailure) clearAuth();
        return false;
      } finally {
        isReissuingRef.current = false;
      }
    },
    [setFromToken, clearAuth]
  );

  // 새로고침 시 로그인 상태 복원
  useEffect(() => {
    const restoreAuth = async () => {
      const existingToken = getAccessToken();
      if (existingToken) {
        setFromToken(existingToken);
        reissueToken().catch(() => {});
      } else {
        await reissueToken(true);
      }
    };
    restoreAuth();
  }, []);

  // 1분마다 만료임박 체크 → 재발급
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  useEffect(() => {
    if (!isLoggedIn) {
      if (reissueIntervalRef.current) {
        clearInterval(reissueIntervalRef.current);
        reissueIntervalRef.current = null;
      }
      return;
    }
    reissueIntervalRef.current = setInterval(() => {
      if (isTokenExpiredOrNearExpiry(1)) reissueToken();
    }, 60 * 1000);
    return () => {
      if (reissueIntervalRef.current) {
        clearInterval(reissueIntervalRef.current);
        reissueIntervalRef.current = null;
      }
    };
  }, [isLoggedIn, reissueToken]);

  // axios interceptor
  useEffect(() => {
    const reqId = axios.interceptors.request.use((config) => {
      const token = getAccessToken();
      if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
      config.withCredentials = true;
      return config;
    });
    const resId = axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        const orig = error.config;
        if (error.response?.status === 401 && !orig._retry) {
          orig._retry = true;
          const ok = await reissueToken(true);
          if (ok) {
            const token = getAccessToken();
            if (token && orig.headers) orig.headers.Authorization = `Bearer ${token}`;
            return axios(orig);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.request.eject(reqId);
      axios.interceptors.response.eject(resId);
    };
  }, [reissueToken]);

  return <>{children}</>;
};

// 하위 호환성 유지
export const useAuth = () => {
  const { isLoggedIn, myUserId } = useAuthStore();
  const router = useRouter();

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

  return { isLoggedIn, myUserId, login, logout };
};
