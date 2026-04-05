// src/schemas/gatheringSchema.ts
// 입력 폼 검증을 위한 Schema
import { z } from 'zod';

export const gatheringSchema = z.object({
  title: z
    .string()
    .min(1, '모임 이름을 입력해주세요.')
    .max(30, '모임 이름은 최대 30자까지 입력 가능합니다.'),
  category: z.string().min(1, '카테고리를 선택해주세요.'),
  capacity: z.coerce
    .number()
    .min(1, '최소 1명 이상이어야 합니다.')
    .max(100, '최대 100명까지 가능합니다.'),
  date: z.string().min(1, '날짜를 선택해주세요.'),
  location: z
    .string()
    .min(1, '장소를 입력해주세요.')
    .max(30, '장소는 최대 30자까지 입력 가능합니다.'),
  openChatUrl: z
    .string()
    .min(1, '오픈채팅 주소를 입력해주세요.')
    .regex(/^https:\/\/.*/, '올바른 링크 형식(https://...)이어야 합니다.'),
  description: z
    .string()
    .min(1, '모임 설명을 입력해주세요.')
    .max(800, '설명은 최대 800자까지 입력 가능합니다.'),
  gatheringImageObjectKey: z.string().nullable().optional(),
});

export type GatheringFormData = z.infer<typeof gatheringSchema>;
