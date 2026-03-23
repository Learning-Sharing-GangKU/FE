/** 페이지네이션 메타 */
export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sortedBy: string;
  hasPrev: boolean;
  hasNext: boolean;
}
