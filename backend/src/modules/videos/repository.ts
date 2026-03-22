import { db } from "../../config/db";

export interface VideoDetailRow {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  video_url: string;
  duration_seconds: number | null;
  order_index: number;
}

export async function getVideoById(
  id: string
): Promise<VideoDetailRow | null> {
  const result = await db.query<VideoDetailRow>(
    `SELECT id, section_id, title, description, video_url, duration_seconds, order_index
     FROM videos
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getPreviousVideo(
  sectionId: string,
  orderIndex: number
): Promise<VideoDetailRow | null> {
  const result = await db.query<VideoDetailRow>(
    `SELECT v.id, v.section_id, v.title, v.description, v.video_url, v.duration_seconds, v.order_index
     FROM videos v
     JOIN sections s ON v.section_id = s.id
     WHERE s.subject_id = (SELECT subject_id FROM sections WHERE id = $1)
       AND (s.order_index < (SELECT order_index FROM sections WHERE id = $1) OR
           (s.order_index = (SELECT order_index FROM sections WHERE id = $1) AND v.order_index < $2))
     ORDER BY s.order_index DESC, v.order_index DESC
     LIMIT 1`,
    [sectionId, orderIndex]
  );
  return result.rows[0] ?? null;
}

export async function getNextVideo(
  sectionId: string,
  orderIndex: number
): Promise<VideoDetailRow | null> {
  const result = await db.query<VideoDetailRow>(
    `SELECT v.id, v.section_id, v.title, v.description, v.video_url, v.duration_seconds, v.order_index
     FROM videos v
     JOIN sections s ON v.section_id = s.id
     WHERE s.subject_id = (SELECT subject_id FROM sections WHERE id = $1)
       AND (s.order_index > (SELECT order_index FROM sections WHERE id = $1) OR
           (s.order_index = (SELECT order_index FROM sections WHERE id = $1) AND v.order_index > $2))
     ORDER BY s.order_index ASC, v.order_index ASC
     LIMIT 1`,
    [sectionId, orderIndex]
  );
  return result.rows[0] ?? null;
}
