import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAccessToken, setAccessToken } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// 글로벌 Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 재발급 여부를 추적하기 위한 잠금 변수 (다중 요청 방지)
let isReissuing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: 요청 전에 Access Token 끼워넣기
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: 401 발생 시 재발급 로직
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // /api/v1/auth/reissue 자체에서 401이 나면 무한루프 방지
      if (originalRequest.url?.includes('/auth/reissue')) {
        useAuthStore.getState().clearAuth(); // 로그인 풀림
        return Promise.reject(error);
      }

      if (isReissuing) {
        // 이미 누군가 재발급을 시도 중이라면 대기열에 넣고 기다림
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
               originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isReissuing = true;

      try {
        // 백엔드 세션(HttpOnly Refresh Token 쿠키)을 이용해 새 토큰 발급 요청
        // 자체 axios 인스턴스 대신 별도로 독립적인 요청을 보내거나, 원시 fetch/axios를 사용하여 인터셉터 꼬임 방지
        const res = await axios.post(`${API_BASE}/api/v1/auth/reissue`, {}, { withCredentials: true });
        
        if (res.data?.accessToken) {
          const newToken = res.data.accessToken;
          // Zustand 대신 lib/auth의 함수로 토큰 저장 (Zustand 상태는 별도 로직에서 싱크됨)
          useAuthStore.getState().setFromToken(newToken);
          
          processQueue(null, newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error('No access token in response');
        }
      } catch (reissueError) {
        processQueue(reissueError, null);
        useAuthStore.getState().clearAuth(); // 토큰 재발급 실패 시 최종 로그아웃 처리
        // 로그인 페이지 등 처리는 앱 최상단이나 미들웨어 등에 위임 (렌더링 방해 않음)
        return Promise.reject(reissueError);
      } finally {
        isReissuing = false;
      }
    }

    // 다른 모든 에러
    return Promise.reject(error);
  }
);

// 하위 호환성을 위한 apiFetch 래퍼 (기존 fetch API와 동일한 인터페이스 제공)
export async function apiFetch(input: string, init: RequestInit = {}) {
  const method = (init.method || 'GET').toUpperCase();
  let data = init.body;

  // fetch는 body에 JSON 문자열을 담으나, axios는 보통 객체를 보냄.
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // JSON 파싱 실패시 문자열 그대로 전송
    }
  }

  try {
    const res: AxiosResponse = await apiClient({
      url: input,
      method,
      data,
      // init.headers를 처리할 경우: 
      // headers: init.headers as any,
    });

    if (res.status === 204) return null;
    return res.data;
  } catch (error: any) {
    // 기존 apiFetch는 ApiError를 던지도록 설계됨
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorData = error.response?.data || {};
      
      let errorMessage = `Request failed: ${status}`;
      let errorCode: string | undefined;

      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
        errorCode = errorData.error.code;
      } else if (errorData.message) {
        errorMessage = errorData.message;
        errorCode = errorData.code;
      }

      throw new ApiError(status, errorMessage, errorCode);
    }
    
    throw new ApiError(500, error?.message || 'Unknown network error');
  }
}
