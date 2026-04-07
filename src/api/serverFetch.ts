/**
 * 서버 컴포넌트 전용 API fetch
 * Next.js 서버 환경에서만 사용.
 */
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// 공개 API (토큰 없이 호출)
async function serverFetch(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) return null;
  if (res.status === 204) return null;
  return res.json();
}

// 인증 API (쿠키에서 토큰 읽어 Authorization 헤더 포함)
async function serverAuthFetch(path: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;

  const res = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  if (res.status === 204) return null;
  return res.json();
}


// ─── 홈 화면 ───────────────────────────────────────────────────
export interface HomeData {
  recommended: { data: any[]; meta: any };
  latest:      { data: any[]; meta: any };
  popular:     { data: any[]; meta: any };
}

function mapItems(items: any[]) {
  return (items ?? []).map((g: any) => ({
    id: g.id,
    title: g.title,
    description: g.description ?? undefined,
    category: g.category,
    imageUrl: g.gatheringImageUrl ?? null,
    participantCount: g.participantCount,
    location: g.location ?? undefined,
  }));
}

export async function fetchHomeSSR(): Promise<HomeData | null> {
  const raw = await serverFetch('/api/v1/home');
  if (!raw) return null;
  return {
    recommended: { data: mapItems(raw.recommended?.data), meta: raw.recommended?.meta },
    latest:      { data: mapItems(raw.latest?.data),      meta: raw.latest?.meta },
    popular:     { data: mapItems(raw.popular?.data),     meta: raw.popular?.meta },
  };
}

// ─── 모임 상세 ──────────────────────────────────────────────────
export async function fetchGatheringDetailSSR(gatheringId: string) {
  const raw = await serverFetch(`/api/v1/gatherings/${gatheringId}`);
  if (!raw) return null;

  const preview = raw.participantsPreview;
  const rawParticipants = Array.isArray(preview?.data) ? preview.data : [];
  const participants = rawParticipants.map((p: any) => ({
    userId: String(p.userId ?? ''),
    nickname: p.nickname ?? '',
    profileImageUrl: p.profileImageUrl ?? null,
    role: p.role ?? null,
    joinedAt: p.joinedAt ?? null,
  }));

  return {
    id: String(raw.id ?? gatheringId),
    title: raw.title ?? '',
    description: raw.description ?? '',
    category: raw.category ?? '',
    imageUrl: raw.gatheringImageUrl ?? null,
    capacity: Number(raw.capacity ?? 0),
    date: raw.date ?? '',
    location: raw.location ?? '',
    status: raw.status ?? '',
    host: { id: String(raw.host?.id ?? ''), nickname: raw.host?.nickname ?? '' },
    participants,
    participantsMeta: preview?.meta ?? { page: 1, size: 0, totalElements: 0, totalPages: 0, sortedBy: '', hasPrev: false, hasNext: false },
    openChatUrl: raw.openChatUrl ?? null,
    participantCount: Number(raw.participantCount ?? 0),
    joined: Boolean(raw.joined ?? false),
    createdAt: raw.createdAt ?? undefined,
    updatedAt: raw.updatedAt ?? undefined,
  };
}

// ─── 모임 리스트 ─────────────────────────────────────────────────
export async function fetchGatheringsSSR(params?: {
  category?: string;
  page?: number;
  size?: number;
  sort?: string;
}) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.page)     query.set('page', String(params.page));
  if (params?.size)     query.set('size', String(params.size));
  if (params?.sort)     query.set('sort', params.sort);

  const raw = await serverFetch(`/api/v1/gatherings?${query.toString()}`);
  if (!raw) return { data: [], meta: null };

  const data = (raw.data ?? []).map((g: any) => ({
    id: g.id,
    title: g.title,
    description: g.description ?? undefined,
    category: g.category,
    imageUrl: g.gatheringImageUrl ?? null,
    hostName: g.hostName,
    participantCount: g.participantCount,
    capacity: g.capacity,
    location: g.location ?? undefined,
  }));

  return { data, meta: raw.meta ?? null };
}

// ─── 내 모임 리스트 (인증 필요) ──────────────────────────────────
export async function fetchUserGatheringsSSR(role: 'host' | 'guest') {
  const raw = await serverAuthFetch(`/api/v1/users/gatherings?role=${role}`);
  if (!raw) return null;

  const data = (raw.data ?? []).map((g: any) => ({
    id: g.id,
    title: g.title,
    category: g.category,
    imageUrl: g.gatheringImageUrl ?? null,
    hostName: g.hostName,
    participantCount: g.participantCount,
    capacity: g.capacity,
  }));

  const meta = raw.meta ?? { page: 1, size: 0, sortedBy: '', hasPrev: false, hasNext: false };
  return { data, meta };
}

// ─── 프로필 조회 (인증 필요) ─────────────────────────────────────
export async function fetchUserProfileSSR(userId: string) {
  const raw = await serverAuthFetch(`/api/v1/users/${userId}`);
  if (!raw) return null;

  const categories = raw.preferredCategories ?? [];
  const preferredCategories =
    categories.length > 0 && typeof categories[0] === 'object'
      ? categories.map((c: any) => c.name)
      : categories;

  const reviewsData = raw.reviewsPreview?.data ?? [];
  const reviewsMeta = raw.reviewsPreview?.meta ?? { size: 0, sortedBy: '', nextCursor: null, hasNext: false };

  return {
    id: String(raw.id ?? ''),
    profileImageUrl: raw.profileImageUrl ?? null,
    nickname: raw.nickname ?? '',
    age: raw.age ?? 0,
    gender: raw.gender ?? 'MALE',
    enrollNumber: raw.enrollNumber ?? 0,
    preferredCategories,
    reviewsPublic: raw.reviewsPublic ?? true,
    rating: raw.reviewsRating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    reviews: reviewsData.map((r: any) => ({
      id: r.id,
      reviewerId: r.reviewerId,
      reviewerProfileImageUrl: r.reviewerProfileImageUrl ?? null,
      reviewerNickname: r.reviewerNickname,
      content: r.content,
      rating: r.rating,
      createdAt: r.createdAt,
    })),
    reviewsMeta: {
      size: reviewsMeta.size,
      sortedBy: reviewsMeta.sortedBy,
      nextCursor: reviewsMeta.nextCursor,
      hasNext: reviewsMeta.hasNext,
    },
  };
}

