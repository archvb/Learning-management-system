import {
  getVideoProgress,
  upsertVideoProgress,
  VideoProgressRow,
} from "./repository";

export async function fetchProgress(
  userId: number,
  videoId: string
): Promise<VideoProgressRow | null> {
  return getVideoProgress(userId, videoId);
}

export async function saveProgress(
  userId: number,
  videoId: string,
  lastPositionSeconds: number,
  isCompleted: boolean
): Promise<VideoProgressRow> {
  return upsertVideoProgress(userId, videoId, lastPositionSeconds, isCompleted);
}
