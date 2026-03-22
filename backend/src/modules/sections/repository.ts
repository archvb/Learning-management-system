import { db } from "../../config/db";

export interface SectionRow {
  id: string;
  subject_id: string;
  title: string;
  order_index: number;
}

export interface VideoRow {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  video_url: string;
  duration_seconds: number | null;
  order_index: number;
}

export interface SubjectContentRow {
  subject_id: string;
  subject_title: string;
  subject_slug: string;
  subject_description: string | null;
  subject_thumbnail_url: string | null;
  section_id: string | null;
  section_title: string | null;
  section_order_index: number | null;
  video_id: string | null;
  video_title: string | null;
  video_description: string | null;
  video_url: string | null;
  video_duration_seconds: number | null;
  video_order_index: number | null;
}

export async function getSubjectContentBySlug(
  slug: string
): Promise<SubjectContentRow[]> {
  const result = await db.query<SubjectContentRow>(
    `SELECT
       s.id              AS subject_id,
       s.title           AS subject_title,
       s.slug            AS subject_slug,
       s.description     AS subject_description,
       s.thumbnail_url   AS subject_thumbnail_url,
       sec.id            AS section_id,
       sec.title         AS section_title,
       sec.order_index   AS section_order_index,
       v.id              AS video_id,
       v.title           AS video_title,
       v.description     AS video_description,
       v.video_url       AS video_url,
       v.duration_seconds AS video_duration_seconds,
       v.order_index     AS video_order_index
     FROM subjects s
     LEFT JOIN sections sec ON sec.subject_id = s.id
     LEFT JOIN videos v ON v.section_id = sec.id
     WHERE s.slug = $1 AND s.published = true
     ORDER BY sec.order_index ASC, v.order_index ASC`,
    [slug]
  );
  return result.rows;
}
