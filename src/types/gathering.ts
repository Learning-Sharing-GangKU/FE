import type { PaginationMeta } from './common';

/** 모임 목록 아이템 */
export interface GatheringItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  imageUrl?: string | null;
  hostName?: string;
  participantCount?: number;
  capacity?: number;
  location?: string;
}

/** 모임 목록 조회용 간단 타입 */
export interface GatheringSummary {
  id: string;
  title: string;
  imageUrl?: string | null;
  category?: string;
}

/** 모임 참여자 */
export interface GatheringParticipant {
  userId: string;
  nickname: string;
  profileImageUrl?: string | null;
  role?: string;
  joinedAt?: string;
}

/** 모임 상세 응답 */
export interface GatheringDetailResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  capacity: number;
  date: string;
  location: string;
  status: string;
  host: { id: string; nickname: string };
  participants: GatheringParticipant[];
  participantsMeta?: PaginationMeta;
  openChatUrl?: string | null;
  isJoined: boolean;
  createdAt?: string;
  updatedAt?: string;
}
