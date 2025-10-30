// src/lib/utils.ts

import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind 클래스 병합 유틸리티
 * - 조건부 클래스 처리를 쉽게 하기 위해 clsx + tailwind-merge를 사용
 * - 예: cn("px-2", isError && "text-red-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}