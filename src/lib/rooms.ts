// Re-exports for backward compatibility — use @/api/gathering and @/types/gathering directly
export { apiFetch } from '@/api/client';
export type {
  GatheringItem,
  GatheringParticipant,
  GatheringDetailResponse,
} from '@/types/gathering';
export {
  getGatheringDetail,
  getGatherings,
  joinGathering,
  exitGathering,
  fetchUserGatherings,
} from '@/api/gathering';
