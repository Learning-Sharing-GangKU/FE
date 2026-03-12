# FE 리팩토링 가이드

## 리팩토링 원칙

1. **한 번에 하나씩** — 여러 곳을 동시에 바꾸면 버그 추적이 어렵다
2. **동작을 먼저 확인** — 리팩토링 전에 현재 동작이 정상인지 확인
3. **작은 단위로 커밋** — 리팩토링 단위마다 커밋해서 롤백 가능하게

---

## Step 1. 공유 타입 정의 (`src/lib/types.ts` 생성)

### 왜?
`GatheringItem` 인터페이스가 `manage/page.tsx`와 `category/page.tsx`에 **동일하게** 중복 정의되어 있다.

### Before (manage/page.tsx:12-20, category/page.tsx:11-19)
```ts
// 두 파일에 각각 존재하는 동일한 코드
interface GatheringItem {
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  hostName: string;
  participantCount: number;
  capacity: number;
}
```

### After — `src/lib/types.ts` 생성
```ts
// src/lib/types.ts
export interface GatheringItem {
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  hostName: string;
  participantCount: number;
  capacity: number;
}

export interface ReviewItem {
  id: string;
  reviewerId: string;
  reviewerProfileImageUrl: string | null;
  reviewerNickname: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface ReviewsMeta {
  size: number;
  sortedBy: string;
  nextCursor: string | null;
  hasNext: boolean;
}

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
```

### 적용 방법
```ts
// manage/page.tsx, category/page.tsx 에서
import { GatheringItem } from '@/lib/types';
// 기존 interface 블록 삭제
```

---

## Step 2. BottomNav 공통 컴포넌트 추출

### 왜?
5개 페이지(home, category, manage, profile, gathering/create)에 **동일한 네비게이션 바가 ~20줄씩 복사**되어 있다. 메뉴 하나 추가하면 5곳을 다 고쳐야 한다.

### After — `src/components/BottomNav.tsx` 생성
```tsx
// src/components/BottomNav.tsx
'use client';

import Link from 'next/link';
import { Home, List, Plus, Users, User } from 'lucide-react';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { href: '/home',            icon: Home,  label: '홈' },
  { href: '/category',        icon: List,  label: '카테고리' },
  { href: '/gathering/create', icon: Plus,  label: '모임 생성' },
  { href: '/manage',          icon: Users, label: '모임 관리' },
  { href: '/profile',         icon: User,  label: '내 페이지' },
] as const;

interface Props {
  active?: string; // 현재 활성 경로 (예: '/home')
}

export default function BottomNav({ active }: Props) {
  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`${styles.navItem} ${active === href ? styles.active : ''}`}
        >
          <Icon size={20} />
          <div>{label}</div>
        </Link>
      ))}
    </nav>
  );
}
```

### 적용 방법
```tsx
// 각 페이지에서 기존 <nav> 블록(~20줄)을 삭제하고:
import BottomNav from '@/components/BottomNav';

// JSX에서:
<BottomNav active="/home" />  // home에서
<BottomNav active="/category" />  // category에서
<BottomNav active="/manage" />  // manage에서
```

### CSS
기존 각 페이지의 `.bottomNav`, `.navItem` 스타일을 `BottomNav.module.css`로 이동.

---

## Step 3. API 클라이언트 통합 (`rooms.ts` 정리)

### 왜?
`rooms.ts`에 `apiFetch()` 유틸이 있지만, 같은 파일의 `getLatestGatherings`, `getPopularGatherings`, `getRecommendedGatherings`가 직접 `fetch()`를 사용. `manage/page.tsx`, `category/page.tsx`도 각각 직접 `fetch()` 호출.

### Before — rooms.ts:185-247 (3개 함수가 거의 동일)
```ts
// getLatestGatherings, getPopularGatherings, getRecommendedGatherings
// 각각 ~20줄, 차이점은 sort 파라미터뿐
export async function getLatestGatherings() {
  const query = new URLSearchParams();
  query.append('sort', 'latest');
  query.append('size', '3');
  const token = getAccessToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings?${query}`,
    { headers: { ... }, credentials: 'include' }
  );
  if (!res.ok) throw new Error("...");
  return res.json();
}
// ↑ 이게 3번 반복됨
```

### After — apiFetch 활용 + 함수 통합
```ts
// rooms.ts 내 기존 apiFetch를 활용
async function fetchGatheringList(
  params: Record<string, string>
) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/v1/gatherings?${query}`);
}

export const getLatestGatherings = () =>
  fetchGatheringList({ sort: 'latest', size: '3' });

export const getPopularGatherings = () =>
  fetchGatheringList({ sort: 'popular', size: '3' });

export const getRecommendedGatherings = () =>
  fetchGatheringList({ sort: 'latest', size: '3' });
```

### 추가: manage/page.tsx, category/page.tsx에서도 apiFetch 활용
```ts
// manage/page.tsx — 기존 27-55줄의 fetchUserGatherings를
// rooms.ts에 이미 있는 fetchUserGatherings를 import해서 사용
import { fetchUserGatherings } from '@/lib/rooms';

// category/page.tsx — 직접 fetch 대신
import { apiFetch } from '@/lib/rooms'; // apiFetch를 export 해야 함
```

> **핵심**: `apiFetch`를 export하고, 모든 API 호출에서 사용.
> Authorization 헤더, credentials, error handling이 자동으로 통일됨.

---

## Step 4. home/page.tsx의 중복 섹션 컴포넌트 정리

### 왜?
`Section` 컴포넌트(16-61줄)와 `renderGroupSection` 함수(63-96줄)가 **동일한 UI를 두 가지 방식으로** 구현. `renderGroupSection`은 사용되지 않음.

### 방법
1. `renderGroupSection` 함수(63-96줄) 삭제
2. `Section` 컴포넌트만 유지
3. data mapping도 정리:

### Before (190-234줄, 동일 패턴 3회 반복)
```tsx
{recommendedQuery.isSuccess && (
  <Section
    title="추천 모임"
    rooms={recommendedQuery.data?.data?.map((g: any) => ({
      id: g.id,
      title: g.title,
      imageUrl: g.gatheringImageUrl ?? null,
    })) ?? []}
    ...
  />
)}
// ↑ 이 패턴이 3번 반복
```

### After — 매핑 함수 추출
```tsx
const mapToRooms = (data: any) =>
  data?.data?.map((g: any) => ({
    id: g.id,
    title: g.title,
    imageUrl: g.gatheringImageUrl ?? null,
  })) ?? [];

// JSX에서
const sections = [
  { title: '추천 모임', query: recommendedQuery, ref: refRecommended },
  { title: '최신 모임', query: latestQuery,      ref: refLatest },
  { title: '인기 모임', query: popularQuery,      ref: refPopular },
] as const;

{sections.map(({ title, query, ref }) =>
  query.isSuccess && (
    <Section
      key={title}
      title={title}
      rooms={mapToRooms(query.data)}
      carouselRef={ref}
      onLeft={() => scrollLeft(ref)}
      onRight={() => scrollRight(ref)}
    />
  )
)}
```

---

## Step 5. 프로필 로직 통합

### 왜?
`profile/page.tsx`와 `profile/[userId]/ProfileClient.tsx`에 **프로필 fetch + 리뷰 매핑 + 더보기 로직이 ~80줄 중복**됨.

### 방법 — 커스텀 훅 추출
```ts
// src/hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';

export function useProfile(userId: string | null, isLoggedIn: boolean | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${userId}`,
        { credentials: 'include' }
      );
      if (!res.ok) { setError('프로필 조회 실패'); return; }
      const raw = await res.json();

      const reviews = raw.reviewsPreview?.data?.map((r: any) => ({
        id: r.id,
        reviewerId: r.reviewerId,
        reviewerProfileImageUrl: r.reviewerProfileImageUrl ?? null,
        reviewerNickname: r.reviewerNickname,
        content: r.content,
        rating: r.rating,
        createdAt: r.createdAt,
      })) ?? [];

      const meta = raw.reviewsPreview?.meta ?? {
        size: 0, sortedBy: '', nextCursor: null, hasNext: false,
      };

      setProfile({
        id: raw.id,
        profileImageUrl: raw.profileImageUrl ?? null,
        nickname: raw.nickname,
        age: raw.age,
        gender: raw.gender,
        enrollNumber: raw.enrollNumber,
        preferredCategories: raw.preferredCategories ?? [],
        rating: raw.rating ?? 0,
        reviewCount: raw.reviewCount ?? 0,
        reviewsPublic: raw.reviewsPublic ?? true,
        reviews,
        reviewsMeta: meta,
      });
    })();
  }, [isLoggedIn, userId]);

  const loadMoreReviews = async () => { /* 기존 로직 */ };

  return { profile, setProfile, error, loadMoreReviews };
}
```

### 적용
```tsx
// profile/page.tsx, profile/[userId]/ProfileClient.tsx 양쪽에서
const { profile, setProfile, loadMoreReviews } = useProfile(userId, isLoggedIn);
// 기존 fetch 로직 ~80줄 삭제
```

---

## Step 6. Toast 훅 추출

### 왜?
login, signup, profile, home에서 toast 상태 관리를 각각 다른 방식으로 구현.

- `login/page.tsx`: `{ visible, message }` 객체
- `home/page.tsx`: `string | null`
- `profile/page.tsx`: `{ visible, message }` + `showToast` 함수

### After — `src/hooks/useToast.ts`
```ts
import { useState, useCallback } from 'react';

export function useToast(duration = 2500) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  }, [duration]);

  return { toast, showToast };
}
```

### 적용
```tsx
const { toast, showToast } = useToast();

// JSX
{toast && <div className={styles.toast}>{toast}</div>}
```

---

## Step 7. console.log 제거

디버그 로그가 프로덕션에 남아있다:

| 파일 | 줄 | 내용 |
|------|-----|------|
| `lib/rooms.ts` | 252 | `console.log("JOIN GATHERING 실행됨")` |
| `signup/page.tsx` | 18 | `console.log("📌 함수 호출됨")` |

전부 삭제하거나, 필요시 `if (process.env.NODE_ENV === 'development')` 래핑.

---

## 실행 순서 요약

| 순서 | 작업 | 영향 범위 | 난이도 |
|------|------|----------|--------|
| 1 | `types.ts` 생성 + 중복 인터페이스 제거 | manage, category, profile, rooms | 낮음 |
| 2 | `BottomNav` 컴포넌트 추출 | home, category, manage, profile, create | 낮음 |
| 3 | `rooms.ts` API 함수 통합 + `apiFetch` export | rooms, manage, category | 중간 |
| 4 | `home/page.tsx` 중복 섹션 정리 | home | 낮음 |
| 5 | `useProfile` 훅 추출 | profile, profile/[userId] | 중간 |
| 6 | `useToast` 훅 추출 | login, signup, profile, home | 낮음 |
| 7 | console.log 제거 | rooms, signup | 낮음 |

각 Step을 완료할 때마다 **빌드 확인 → 동작 확인 → 커밋** 순서로 진행하면 안전하다.
