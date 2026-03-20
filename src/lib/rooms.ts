// Re-exports for backward compatibility — use @/api/gathering and @/types/gathering directly
export { apiFetch } from '@/api/client';
export type {
  GatheringItem,
  GatheringSummary,
  GatheringParticipant,
  GatheringDetailResponse,
} from '@/types/gathering';
export {
  getGatheringDetail,
  getGatherings,
  getLatestGatherings,
  getPopularGatherings,
  getRecommendedGatherings,
  joinGathering,
  exitGathering,
  fetchUserGatherings,
} from '@/api/gathering';
