/** 로그인 요청 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 로그인 응답 */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

/** 회원가입 요청 */
export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  enrollNumber: number;
  profileImageObjectKey?: string;
  preferredCategories: string[];
}

/** 회원가입 응답 */
export interface SignupResponse {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  age: number;
  gender: string;
  enrollNumber: number;
  preferredCategories: string[];
  createdAt: string;
}
