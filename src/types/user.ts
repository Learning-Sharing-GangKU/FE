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

/** 리뷰 메타 (페이지네이션) */
export interface ReviewsMeta {
  size: number;
  sortedBy: string;
  nextCursor: string | null;
  hasNext: boolean;
}

/** 유저 프로필 */
export interface UserProfile {
  id: string;
  profileImageUrl: string | null;
  nickname: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  enrollNumber: number;
  preferredCategories: string[];
  rating: number;
  reviewCount: number;
  reviewsPublic: boolean;
  reviews: ReviewItem[];
  reviewsMeta: ReviewsMeta;
}
