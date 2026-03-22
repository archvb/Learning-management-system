import {
  getVideoById,
  getPreviousVideo,
  getNextVideo,
  VideoDetailRow,
} from "./repository";

import { getUserProgressForVideos } from "../progress/repository";

export interface VideoWithNavigation {
  video: VideoDetailRow;
  previous: VideoDetailRow | null;
  next: VideoDetailRow | null;
  previous_video_id?: string;
  next_video_id?: string;
  is_locked?: boolean;
  is_completed?: boolean;
  unlock_reason?: string;
}

export async function getVideo(id: string, userId?: number): Promise<VideoWithNavigation> {
  const video = await getVideoById(id);
  if (!video) {
    throw Object.assign(new Error("Video not found"), { status: 404 });
  }

  const [previous, next] = await Promise.all([
    getPreviousVideo(video.section_id, video.order_index),
    getNextVideo(video.section_id, video.order_index),
  ]);

  let is_locked = true;
  let is_completed = false;
  let unlock_reason = "Complete previous video to unlock this";

  if (!previous) {
    is_locked = false;
    unlock_reason = "";
  }

  if (userId) {
    const idsToFetch = [id];
    if (previous) idsToFetch.push(previous.id);
    const progressList = await getUserProgressForVideos(userId, idsToFetch);
    const progressMap = new Map(progressList.map((p) => [p.video_id, p]));

    is_completed = progressMap.get(id)?.is_completed ?? false;
    if (previous) {
      if (progressMap.get(previous.id)?.is_completed) {
        is_locked = false;
        unlock_reason = "";
      }
    }
  }

  return { 
    video, 
    previous, 
    next,
    previous_video_id: previous?.id,
    next_video_id: next?.id,
    is_locked,
    is_completed,
    unlock_reason
  };
}
