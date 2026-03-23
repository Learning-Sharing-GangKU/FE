import { apiFetch } from '@/api/client';
import type {
  GatheringItem,
  GatheringDetailResponse,
} from '@/types/gathering';
import type { PaginationMeta } from '@/types/common';

export async function getGatheringDetail(gatheringId: string): Promise<GatheringDetailResponse> {
  const raw = await apiFetch(`/api/v1/gatherings/${gatheringId}`);

  const preview = raw?.participantsPreview;
  const rawParticipants = Array.isArray(preview?.data) ? preview.data : [];

  const participants = rawParticipants.map((p: any) => ({
    userId: String(p.userId ?? ''),
    nickname: p.nickname ?? '',
    profileImageUrl: p.profileImageUrl ?? null,
    role: p.role ?? null,
    joinedAt: p.joinedAt ?? null,
  }));

  const participantsMeta = preview?.meta ?? {
    page: 1,
    size: participants.length,
    totalElements: participants.length,
    totalPages: 1,
    sortedBy: 'joinedAt,asc',
    hasPrev: false,
    hasNext: false,
  };

  return {
    id: String(raw?.id ?? gatheringId),
    title: raw?.title ?? '',
    description: raw?.description ?? '',
    category: raw?.category ?? '',
    imageUrl: raw?.gatheringImageUrl ?? null,
    capacity: Number(raw?.capacity ?? 0),
    date: raw?.date ?? '',
    location: raw?.location ?? '',
    status: raw?.status ?? '',
    host: {
      id: String(raw?.host?.id ?? ''),
      nickname: raw?.host?.nickname ?? '',
    },
    participants,
    participantsMeta,
    openChatUrl: raw?.openChatUrl ?? null,
    isJoined: Boolean(raw?.isJoined ?? false),
    createdAt: raw?.createdAt ?? undefined,
    updatedAt: raw?.updatedAt ?? undefined,
  };
}

export async function getGatherings(params?: {
  category?: string;
  page?: number;
  size?: number;
  sort?: 'latest' | 'popular' | 'recommended';
}): Promise<{ data: GatheringItem[]; meta: PaginationMeta }> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.page) query.set('page', String(params.page));
  if (params?.size) query.set('size', String(params.size));
  if (params?.sort) query.set('sort', params.sort);

  const raw = await apiFetch(`/api/v1/gatherings?${query.toString()}`);
  const list = raw?.data ?? [];

  const data = list.map((g: any) => ({
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

  const meta = raw?.meta ?? {
    page: 1,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    sortedBy: '',
    hasPrev: false,
    hasNext: false,
  };

  return { data, meta };
}

/** 홈 API 응답 타입 */
export interface HomeResponse {
  recommended: { data: GatheringItem[]; meta: PaginationMeta };
  latest: { data: GatheringItem[]; meta: PaginationMeta };
  popular: { data: GatheringItem[]; meta: PaginationMeta };
}

function mapHomeItems(items: any[]): GatheringItem[] {
  return items.map((g: any) => ({
    id: g.id,
    title: g.title,
    description: g.description ?? undefined,
    category: g.category,
    imageUrl: g.gatheringImageUrl ?? null,
    participantCount: g.participantCount,
    location: g.location ?? undefined,
  }));
}

/** GET /api/v1/home — 홈 화면 데이터 */
export async function getHome(): Promise<HomeResponse> {
  const raw = await apiFetch('/api/v1/home');

  const defaultMeta: PaginationMeta = {
    page: 1, size: 0, totalElements: 0, totalPages: 0,
    sortedBy: '', hasPrev: false, hasNext: false,
  };

  return {
    recommended: {
      data: mapHomeItems(raw?.recommended?.data ?? []),
      meta: raw?.recommended?.meta ?? defaultMeta,
    },
    latest: {
      data: mapHomeItems(raw?.latest?.data ?? []),
      meta: raw?.latest?.meta ?? defaultMeta,
    },
    popular: {
      data: mapHomeItems(raw?.popular?.data ?? []),
      meta: raw?.popular?.meta ?? defaultMeta,
    },
  };
}

export async function joinGathering(gatheringId: string): Promise<void> {
  await apiFetch(`/api/v1/gatherings/${gatheringId}/participants`, { method: 'POST' });
}

export async function exitGathering(gatheringId: string): Promise<void> {
  await apiFetch(`/api/v1/gatherings/${gatheringId}/participants`, { method: 'DELETE' });
}

export async function fetchUserGatherings(role: 'host' | 'guest'): Promise<GatheringItem[]> {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  if (!userId) return [];

  const data = await apiFetch(
    `/api/v1/users/gatherings?role=${role}&page=1&size=10&sort=createdAt,desc`
  );
  const list = data?.data ?? [];

  return list.map((g: any) => ({
    id: g.id,
    title: g.title,
    category: g.category,
    imageUrl: g.gatheringImageUrl ?? null,
    hostName: g.hostName,
    participantCount: g.participantCount,
    capacity: g.capacity,
  }));
}
