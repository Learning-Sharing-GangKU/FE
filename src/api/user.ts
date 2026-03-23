import { apiFetch } from '@/api/client';
import type { UserProfile, ReviewItem, ReviewsMeta, UpdateProfilePayload } from '@/types/user';

/** GET /api/v1/users/{userId} — 프로필 조회 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const raw = await apiFetch(`/api/v1/users/${userId}`);

  const categories = raw?.preferredCategories ?? [];
  const preferredCategories =
    categories.length > 0 && typeof categories[0] === 'object'
      ? categories.map((c: any) => c.name)
      : categories;

  const reviewsData = raw?.reviewsPreview?.data ?? [];
  const reviewsMeta = raw?.reviewsPreview?.meta ?? {
    size: 0,
    sortedBy: '',
    nextCursor: null,
    hasNext: false,
  };

  return {
    id: String(raw?.id ?? ''),
    profileImageUrl: raw?.profileImageUrl ?? null,
    nickname: raw?.nickname ?? '',
    age: raw?.age ?? 0,
    gender: raw?.gender ?? 'MALE',
    enrollNumber: raw?.enrollNumber ?? 0,
    preferredCategories,
    reviewPublic: raw?.reviewPublic ?? true,
    averageRating: raw?.averageRating ?? 0,
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

/** PATCH /api/v1/users/{userId} — 프로필 수정 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfilePayload
): Promise<void> {
  await apiFetch(`/api/v1/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** GET /api/v1/users/{userId}/reviews?cursor=xxx — 리뷰 더보기 */
export async function getUserReviews(
  userId: string,
  cursor: string
): Promise<{ reviews: ReviewItem[]; meta: ReviewsMeta }> {
  const raw = await apiFetch(`/api/v1/users/${userId}/reviews?cursor=${cursor}`);

  const reviews = (raw?.data ?? []).map((r: any) => ({
    id: r.id,
    reviewerId: r.reviewerId,
    reviewerProfileImageUrl: r.reviewerProfileImageUrl ?? null,
    reviewerNickname: r.reviewerNickname,
    content: r.content,
    rating: r.rating,
    createdAt: r.createdAt,
  }));

  const meta = raw?.meta ?? {
    size: 0,
    sortedBy: '',
    nextCursor: null,
    hasNext: false,
  };

  return { reviews, meta };
}
