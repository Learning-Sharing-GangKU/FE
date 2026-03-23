/** 리뷰 아이템 */
export interface ReviewItem {
  id: string;
  reviewerId: string;
  reviewerProfileImageUrl: string | null;
  reviewerNickname: string;
  content: string;
  rating: number;
  createdAt: string;
}

/** 리뷰 커서 기반 메타 */
export interface ReviewsMeta {
  size: number;
  sortedBy: string;
  nextCursor: string | null;
  hasNext: boolean;
}

/** 프로필 수정 요청 바디 */
export interface UpdateProfilePayload {
  nickname?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED';
  enrollNumber?: number;
  preferredCategories?: string[];
  profileImageObjectKey?: string;
}

/** 리뷰 작성 요청 */
export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

/** 리뷰 작성 응답 */
export interface CreateReviewResponse {
  reviewId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/** 유저 요약 (리뷰 대상 등) */
export interface UserSummary {
  nickname: string;
  age: number;
  enrollNumber: number;
  gender: string;
  profileImageUrl?: string | null;
  preferredCategories: string[];
}

/** 유저 프로필 */
export interface UserProfile {
  id: string;
  profileImageUrl: string | null;
  nickname: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED';
  enrollNumber: number;
  preferredCategories: string[];
  reviewPublic: boolean;
  averageRating: number;
  reviews: ReviewItem[];
  reviewsMeta: ReviewsMeta;
}
