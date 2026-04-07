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


/** 모임 참여자 */
export interface GatheringParticipant {
  userId: string;
  nickname: string;
  profileImageUrl?: string | null;
  role?: string;
  joinedAt?: string;
}

/** 모임 생성 요청 */
export interface CreateGatheringRequest {
  title: string;
  gatheringImageObjectKey?: string;
  category: string;
  capacity: number;
  date: string;
  location: string;
  openChatUrl: string;
  description: string;
}

/** 모임 생성 응답 */
export interface CreateGatheringResponse {
  id: string;
  title: string;
  gatheringImageUrl: string | null;
  category: string;
  capacity: number;
  date: string;
  location: string;
  openChatUrl: string;
  description: string;
  status: string;
  hostId: string;
  createdAt: string;
  updatedAt: string;
}

/** 모임 수정 요청 (부분 수정) */
export interface UpdateGatheringRequest {
  title?: string;
  gatheringImageObjectKey?: string;
  category?: string;
  capacity?: number;
  date?: string;
  location?: string;
  openChatUrl?: string;
  description?: string;
}

/** 모임 참여 응답 */
export interface JoinGatheringResponse {
  participantId: string;
  gatheringId: string;
  userId: string;
  role: string;
  participantCount: number;
  capacity: number;
  joinedAt: string;
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
  participantCount: number;
  joined: boolean;
  createdAt?: string;
  updatedAt?: string;
}
