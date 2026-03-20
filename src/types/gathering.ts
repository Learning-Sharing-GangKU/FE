/** 모임 목록 아이템 */
export interface GatheringItem {
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  hostName: string;
  participantCount: number;
  capacity: number;
}

/** 모임 목록 조회용 간단 타입 */
export interface GatheringSummary {
  id: number;
  title: string;
  imageUrl?: string | null;
  category?: string;
}

/** 모임 참여자 */
export interface GatheringParticipant {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
  role?: string;
  joinedAt?: string;
}

/** 모임 상세 응답 */
export interface GatheringDetailResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  capacity: number;
  date: string;
  location: string;
  host: { id: number; nickname: string };
  participants: GatheringParticipant[];
  participantsMeta?: {
    page?: number;
    size?: number;
    totalElements?: number;
    sortedBy?: string;
    nextCursor?: string | null;
  };
  openChatUrl?: string | null;
  isJoined: boolean;
}
