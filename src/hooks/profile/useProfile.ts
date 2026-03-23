import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/types/user';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

function mapReviews(raw: any) {
  return (
    raw.reviewsPreview?.data?.map((r: any) => ({
      id: r.id,
      reviewerId: r.reviewerId,
      reviewerProfileImageUrl: r.reviewerProfileImageUrl ?? null,
      reviewerNickname: r.reviewerNickname,
      content: r.content,
      rating: r.rating,
      createdAt: r.createdAt,
    })) ?? []
  );
}

function mapMeta(raw: any) {
  const meta = raw.reviewsPreview?.meta ?? {
    size: 0,
    sortedBy: '',
    nextCursor: null,
    hasNext: false,
  };
  return {
    size: meta.size,
    sortedBy: meta.sortedBy,
    nextCursor: meta.nextCursor,
    hasNext: meta.hasNext,
  };
}

function mapProfile(raw: any): UserProfile {
  const categories = raw.preferredCategories ?? [];
  const preferredCategories =
    categories.length > 0 && typeof categories[0] === 'object'
      ? categories.map((c: any) => c.name)
      : categories;

  return {
    id: raw.id,
    profileImageUrl: raw.profileImageUrl ?? null,
    nickname: raw.nickname,
    age: raw.age,
    gender: raw.gender,
    enrollNumber: raw.enrollNumber,
    preferredCategories,
    rating: raw.reviewsRating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    reviewsPublic: raw.reviewsPublic ?? true,
    reviews: mapReviews(raw),
    reviewsMeta: mapMeta(raw),
  };
}

interface UseProfileReturn {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  error: string | null;
  loadMoreReviews: () => Promise<void>;
}

export function useProfile(
  userId: string | null,
  isLoggedIn: boolean | null
): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/users/${userId}`, {
          credentials: 'include',
        });

        if (res.status === 404) {
          setError('존재하지 않는 사용자입니다.');
          return;
        }
        if (res.status === 401) {
          setError('로그인이 필요합니다.');
          return;
        }
        if (!res.ok) throw new Error('프로필 조회 실패');

        const raw = await res.json();
        setProfile(mapProfile(raw));
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, [isLoggedIn, userId]);

  const loadMoreReviews = useCallback(async () => {
    if (!profile || !profile.reviewsMeta.hasNext) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/users/${profile.id}/reviews?cursor=${profile.reviewsMeta.nextCursor}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('리뷰 불러오기 실패');

      const more = await res.json();
      const newItems = more.data.map((r: any) => ({
        id: r.id,
        reviewerId: r.reviewerId,
        reviewerProfileImageUrl: r.reviewerProfileImageUrl ?? null,
        reviewerNickname: r.reviewerNickname,
        content: r.content,
        rating: r.rating,
        createdAt: r.createdAt,
      }));

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              reviews: [...prev.reviews, ...newItems],
              reviewsMeta: {
                size: more.meta.size,
                sortedBy: more.meta.sortedBy,
                nextCursor: more.meta.nextCursor,
                hasNext: more.meta.hasNext,
              },
            }
          : prev
      );
    } catch (err: any) {
      setError(err.message);
    }
  }, [profile]);

  return { profile, setProfile, error, loadMoreReviews };
}
