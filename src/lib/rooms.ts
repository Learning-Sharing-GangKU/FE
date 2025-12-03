import { getAccessToken } from '@/lib/auth';

export interface GatheringParticipant {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
  role?: string;
  joinedAt?: string;
}

export interface GatheringDetailResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  capacity: number;
  date: string; // ISO string
  location: string;
  host: { id: number; nickname: string };

  participants: GatheringParticipant[];

  // 🔥 필요하면 메타는 옵션으로 분리
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

async function apiFetch(input: string, init: RequestInit = {}) {
  // const token = getAccessToken();
  let token: string | null = null;
  try {
    const t = getAccessToken(); 
    if (typeof t === 'string' && t.trim() !== '') {
      token = t.trim(); // '' 방지
    }
  } catch {
    token = null;
  }
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${input}`, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    const message = `Request failed: ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ✅ "gath_" 접두어를 제거하고 숫자만 백엔드로 보냄
export async function getGatheringDetail(gatheringId: string): Promise<GatheringDetailResponse> {
  const raw = await apiFetch(`/api/v1/gatherings/${gatheringId}`);
  // Normalize backend response to the expected shape defensively

  // inside getGatheringDetail()
  const preview = raw?.participantsPreview;

  const rawParticipants = Array.isArray(preview?.data)
    ? preview.data
    : [];

  const participants = rawParticipants.map((p: any) => ({
    userId: p.userId ?? p.id ?? 0, // 안전 fallback
    nickname: p.nickname ?? '',
    profileImageUrl: p.profileImageUrl ?? null,
    role: p.role ?? null,
    joinedAt: p.joinedAt ?? null,
    }));

  const participantsMeta = preview?.meta ?? {
    page: 0,
    size: participants.length,
    totalElements: participants.length,
    sortedBy: 'joinedAt',
    nextCursor: null,
  };
  const host =
    raw?.host ??
    (raw?.hostId || raw?.hostNickname
      ? { id: raw.hostId ?? 0, nickname: raw.hostNickname ?? '' }
      : { id: 0, nickname: '' });

  return {
    id: raw?.id ?? raw?.gatheringId ?? Number(gatheringId),
    title: raw?.title ?? raw?.name ?? '',
    description: raw?.description ?? '',
    category: raw?.category ?? raw?.categoryName ?? '',
    imageUrl: raw?.imageUrl ?? raw?.thumbnailUrl ?? raw?.mainImageUrl ?? raw?.image ?? null,
    capacity: Number(raw?.capacity ?? raw?.maxParticipants ?? 0),
    date: raw?.date ?? raw?.scheduledAt ?? '',
    location: raw?.location ?? raw?.place ?? '',
    host,
    participants: participants,      // 🔥 여기서 평탄화된 배열 전달
    participantsMeta,                   // 🔥 메타는 옵션
    openChatUrl: raw?.openChatUrl ?? raw?.chatUrl ?? null,
    isJoined: Boolean(raw?.isJoined ?? raw?.joined ?? false),
  };
}
// 목록 조회용 간단 타입
export interface GatheringSummary {
  id: number;
  title: string;
  imageUrl?: string | null;
  category?: string;
}

// 방 목록 조회
// 백엔드 엔드포인트가 확정되면 쿼리 파라미터(정렬/페이지 등) 확장
export async function getGatherings(): Promise<GatheringSummary[]> {
  const raw = await apiFetch(`/api/v1/gatherings`);
  // Normalize various possible backend response shapes:
  // - Array<GatheringSummary>
  // - { content: Array<...> }  (Spring Pageable common)
  // - { items: Array<...> }    (generic)
  // - { data: Array<...> }     (wrapped)
  // - { records/results: Array<...> } (other variants)
  const list: any[] =
    Array.isArray(raw)
      ? raw
      : raw?.content ??
        raw?.items ??
        raw?.data ??
        raw?.records ??
        raw?.results ??
        [];

  // Map to GatheringSummary with safe fallbacks for common field names
  return list.map((g: any) => ({
    id: g.id ?? g.gatheringId ?? g.roomId, // support legacy keys
    title: g.title ?? g.name ?? '',
    imageUrl:
      g.imageUrl ??
      g.thumbnailUrl ??
      g.mainImageUrl ??
      g.image ??
      null,
    category: g.category ?? g.categoryName ?? undefined,
  })) as GatheringSummary[];
}


// 👉 최신 3개
export async function getLatestGatherings() {
  const query = new URLSearchParams();
  query.append('page', '1');
  query.append('sort', 'latest');
  query.append('size', '3');
  const token = getAccessToken();
  const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings?${query.toString()}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: 'include',
          }
        );
  if (!res.ok) 
    throw new Error("최신 모임 불러오기 실패");
  return res.json();
}

// 👉 인기 3개
export async function getPopularGatherings() {
  const query = new URLSearchParams();
  query.append('sort', 'popular');
  query.append('size', '3');
  const token = getAccessToken();
  const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings?${query.toString()}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: 'include',
          }
        );
  if (!res.ok) 
    throw new Error("인기 모임 불러오기 실패");
  return res.json();
}

// 👉 추천 3개
export async function getRecommendedGatherings() {
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings?sort=recommended&size=3`);
  const query = new URLSearchParams();
  query.append('sort', 'latest');
  query.append('size', '3');
  const token = getAccessToken();
  const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings?${query.toString()}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: 'include',
          }
        );
  if (!res.ok) 
    throw new Error("추천 모임 불러오기 실패");
  return res.json();
}



export async function joinGathering(gatheringId: string): Promise<void> {
  console.log("JOIN GATHERING 실행됨", gatheringId);
  const token = getAccessToken();
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings/${gatheringId}/participants`,
    { method: 'POST',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
     }
    }
  );
}

export async function exitGathering(gatheringId: string): Promise<void> {
  const token = getAccessToken();
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings/${gatheringId}/participants`,
    { method: 'DELETE' ,
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
     }
    }
  );
}


