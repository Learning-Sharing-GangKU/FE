'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import axios from 'axios';
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  isTokenExpiredOrNearExpiry,
} from '@/lib/auth';

interface AuthContextType {
  isLoggedIn: boolean | null; // null = 로딩 중, true = 로그인, false = 로그아웃
  myUserId: number | null;    // 현재 로그인한 유저의 ID (JWT sub)
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** ✅ JWT accessToken 에서 sub(userId) 파싱 */
function getUserIdFromToken(token?: string | null): number | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload)); // { sub: "1", iat, exp ... }
    const sub = decoded?.sub;
    const num = Number(sub);
    return Number.isFinite(num) ? num : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  const reissueIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isReissuingRef = useRef(false);

  // ✅ 토큰 재발급
  const reissueToken = useCallback(
    async (forceLogoutOnFailure = false): Promise<boolean> => {
      if (isReissuingRef.current) {
        return false;
      }

      try {
        isReissuingRef.current = true;

        const res = await axios.post(
          '/api/v1/auth/reissue',
          {},
          { withCredentials: true }
        );

        if (res.data?.accessToken) {
          const newToken = res.data.accessToken;
          setAccessToken(newToken);

          // 🔹 새 토큰에서 userId 다시 파싱
          const uid = getUserIdFromToken(newToken);
          setMyUserId(uid);
          if (uid != null) {
            localStorage.setItem('userId', String(uid));
          } else {
            localStorage.removeItem('userId');
          }

          setIsLoggedIn(true);
          return true;
        } else {
          if (forceLogoutOnFailure) {
            removeAccessToken();
            setMyUserId(null);
            localStorage.removeItem('userId');
            setIsLoggedIn(false);
          }
          return false;
        }
      } catch (err) {
        console.warn('토큰 재발급 실패:', err);
        if (forceLogoutOnFailure) {
          removeAccessToken();
          setMyUserId(null);
          localStorage.removeItem('userId');
          setIsLoggedIn(false);
        }
        return false;
      } finally {
        isReissuingRef.current = false;
      }
    },
    []
  );

  // ✅ 새로고침 시 로그인 상태 복원
  useEffect(() => {
    const restoreAuth = async () => {
      const existingToken = getAccessToken();

      if (existingToken) {
        // 1) 토큰에서 userId 복원
        const uid = getUserIdFromToken(existingToken);
        setMyUserId(uid);
        if (uid != null) {
          localStorage.setItem('userId', String(uid));
        }
        setIsLoggedIn(true);

        // 2) 백그라운드에서 재발급 시도 (실패해도 기존 토큰 유지)
        reissueToken().catch(() => {});
      } else {
        // 토큰 없으면 재발급 시도 (실패 시 로그아웃 처리)
        await reissueToken(true);
      }
    };

    restoreAuth();
  }, [reissueToken]);

  // ✅ 1분마다 만료임박 체크 → 재발급
  useEffect(() => {
    if (!isLoggedIn) {
      if (reissueIntervalRef.current) {
        clearInterval(reissueIntervalRef.current);
        reissueIntervalRef.current = null;
      }
      return;
    }

    reissueIntervalRef.current = setInterval(() => {
      if (isTokenExpiredOrNearExpiry(1)) {
        console.log('토큰 만료 임박, 자동 재발급 시도...');
        reissueToken();
      }
    }, 60 * 1000);

    return () => {
      if (reissueIntervalRef.current) {
        clearInterval(reissueIntervalRef.current);
        reissueIntervalRef.current = null;
      }
    };
  }, [isLoggedIn, reissueToken]);

  // ✅ 로그인 시 AccessToken 저장 + userId 세팅
  const login = (token: string) => {
    setAccessToken(token);

    const uid = getUserIdFromToken(token);
    setMyUserId(uid);
    if (uid != null) {
      localStorage.setItem('userId', String(uid));
    } else {
      localStorage.removeItem('userId');
    }

    setIsLoggedIn(true);
  };

  // ✅ axios interceptor 설정
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.withCredentials = true;
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const success = await reissueToken(true);

          if (success) {
            const token = getAccessToken();
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axios(originalRequest);
          } else {
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [reissueToken]);

  // ✅ 로그아웃
  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('로그아웃 API 요청 실패:', err);
    } finally {
      removeAccessToken();
      setMyUserId(null);
      localStorage.removeItem('userId');
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, myUserId, login, logout }}>
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