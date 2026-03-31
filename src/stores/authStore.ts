import { create } from 'zustand';
import { setAccessToken, removeAccessToken } from '@/lib/auth';

/** JWT payload에서 userId(sub) 파싱 → "usr_12" 형식으로 반환 */
export function getUserIdFromToken(token?: string | null): string | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    const num = Number(decoded?.sub);
    return Number.isFinite(num) ? `usr_${num}` : null;
  } catch {
    return null;
  }
}

interface AuthState {
  isLoggedIn: boolean | null; // null = 초기화 중
  myUserId: string | null;    // "usr_12" 형식
  login: (token: string) => void;
  logout: () => void;
  setFromToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: null,
  myUserId: null,

  /** 로그인 — 토큰 저장 + 상태 세팅 */
  login: (token: string) => {
    setAccessToken(token);
    const uid = getUserIdFromToken(token);
    if (uid != null) localStorage.setItem('userId', uid);
    else localStorage.removeItem('userId');
    set({ isLoggedIn: true, myUserId: uid });
  },

  /** 로그아웃 — 상태 초기화 */
  logout: () => {
    removeAccessToken();
    localStorage.removeItem('userId');
    set({ isLoggedIn: false, myUserId: null });
  },

  /** 토큰으로 상태 복원 (재발급 성공 시) */
  setFromToken: (token: string) => {
    setAccessToken(token);
    const uid = getUserIdFromToken(token);
    if (uid != null) localStorage.setItem('userId', uid);
    else localStorage.removeItem('userId');
    set({ isLoggedIn: true, myUserId: uid });
  },

  /** 인증 실패 시 초기화 */
  clearAuth: () => {
    removeAccessToken();
    localStorage.removeItem('userId');
    set({ isLoggedIn: false, myUserId: null });
  },
}));
