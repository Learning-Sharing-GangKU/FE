import { apiFetch } from '@/api/client';
import type {
  GatheringItem,
  GatheringSummary,
  GatheringDetailResponse,
} from '@/types/gathering';

export async function getGatheringDetail(gatheringId: string): Promise<GatheringDetailResponse> {
  const raw = await apiFetch(`/api/v1/gatherings/${gatheringId}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const preview = raw?.participantsPreview;
  const rawParticipants = Array.isArray(preview?.data) ? preview.data : [];

  const participants = rawParticipants.map((p: any) => ({
    userId: p.userId ?? p.id ?? 0,
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
    imageUrl:
      raw?.gatheringImageUrl ??
      raw?.fileUrl ??
      raw?.thumbnailUrl ??
      raw?.mainImageUrl ??
      raw?.image ??
      null,
    capacity: Number(raw?.capacity ?? raw?.maxParticipants ?? 0),
    date: raw?.date ?? raw?.scheduledAt ?? '',
    location: raw?.location ?? raw?.place ?? '',
    host,
    participants,
    participantsMeta,
    openChatUrl: raw?.openChatUrl ?? raw?.chatUrl ?? null,
    isJoined: Boolean(raw?.isJoined ?? raw?.joined ?? false),
  };
}

export async function getGatherings(): Promise<GatheringSummary[]> {
  const raw = await apiFetch(`/api/v1/gatherings`);
  const list: any[] =
    Array.isArray(raw)
      ? raw
      : raw?.content ?? raw?.items ?? raw?.data ?? raw?.records ?? raw?.results ?? [];

  return list.map((g: any) => ({
    id: g.id ?? g.gatheringId ?? g.roomId,
    title: g.title ?? g.name ?? '',
    imageUrl: g.imageUrl ?? g.thumbnailUrl ?? g.mainImageUrl ?? g.image ?? null,
    category: g.category ?? g.categoryName ?? undefined,
  })) as GatheringSummary[];
}

function fetchGatheringList(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/v1/gatherings?${query}`);
}

export const getLatestGatherings = () =>
  fetchGatheringList({ page: '1', sort: 'latest', size: '3' });

export const getPopularGatherings = () =>
  fetchGatheringList({ sort: 'popular', size: '3' });

export const getRecommendedGatherings = () =>
  fetchGatheringList({ sort: 'latest', size: '3' });

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
