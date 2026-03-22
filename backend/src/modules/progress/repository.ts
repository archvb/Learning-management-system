import { db } from "../../config/db";

export interface VideoProgressRow {
  id: string;
  user_id: string;
  video_id: string;
  last_position_seconds: number;
  is_completed: boolean;
  updated_at: Date;
}

export async function getVideoProgress(
  userId: number,
  videoId: string
): Promise<VideoProgressRow | null> {
  const result = await db.query<VideoProgressRow>(
    `SELECT * FROM video_progress
     WHERE user_id = $1 AND video_id = $2`,
    [userId, videoId]
  );
  return result.rows[0] ?? null;
}

export async function getUserProgressForVideos(
  userId: number,
  videoIds: string[]
): Promise<VideoProgressRow[]> {
  if (videoIds.length === 0) return [];
  const result = await db.query<VideoProgressRow>(
    `SELECT * FROM video_progress
     WHERE user_id = $1 AND video_id = ANY($2)`,
    [userId, videoIds]
  );
  return result.rows;
}

export async function upsertVideoProgress(
  userId: number,
  videoId: string,
  lastPositionSeconds: number,
  isCompleted: boolean
): Promise<VideoProgressRow> {
  const result = await db.query<VideoProgressRow>(
    `INSERT INTO video_progress (user_id, video_id, last_position_seconds, is_completed)
     VALUES ($1, $2, LEAST($3::numeric, COALESCE((SELECT duration_seconds FROM videos WHERE id = $2), $3::numeric)), $4)
     ON CONFLICT (user_id, video_id)
     DO UPDATE SET
       last_position_seconds = LEAST(EXCLUDED.last_position_seconds, COALESCE((SELECT duration_seconds FROM videos WHERE id = EXCLUDED.video_id), EXCLUDED.last_position_seconds)),
       is_completed = EXCLUDED.is_completed,
       updated_at = NOW()
     RETURNING *`,
    [userId, videoId, lastPositionSeconds, isCompleted]
  );
  return result.rows[0];
}
