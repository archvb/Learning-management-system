import { getSubjectContentBySlug, SubjectContentRow } from "./repository";
import { getUserProgressForVideos } from "../progress/repository";

export interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  duration_seconds: number | null;
  order_index: number;
  is_locked?: boolean;
  is_completed?: boolean;
}

export interface SectionItem {
  id: string;
  title: string;
  order_index: number;
  videos: VideoItem[];
}

export interface SubjectContent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  sections: SectionItem[];
}

export async function getSubjectContent(
  slug: string,
  userId?: number
): Promise<SubjectContent> {
  const rows = await getSubjectContentBySlug(slug);

  if (rows.length === 0) {
    throw Object.assign(new Error("Subject not found"), { status: 404 });
  }

  // Build nested structure from flat JOIN rows
  const sectionsMap = new Map<string, SectionItem>();

  const subject: SubjectContent = {
    id: rows[0].subject_id,
    title: rows[0].subject_title,
    slug: rows[0].subject_slug,
    description: rows[0].subject_description,
    thumbnail_url: rows[0].subject_thumbnail_url,
    sections: [],
  };

  for (const row of rows) {
    if (row.section_id) {
      if (!sectionsMap.has(row.section_id)) {
        const section: SectionItem = {
          id: row.section_id,
          title: row.section_title!,
          order_index: row.section_order_index!,
          videos: [],
        };
        sectionsMap.set(row.section_id, section);
      }

      if (row.video_id) {
        sectionsMap.get(row.section_id)!.videos.push({
          id: row.video_id,
          title: row.video_title!,
          description: row.video_description,
          video_url: row.video_url!,
          duration_seconds: row.video_duration_seconds,
          order_index: row.video_order_index!,
        });
      }
    }
  }

  subject.sections = Array.from(sectionsMap.values());

  const allVideos = subject.sections.flatMap((s) => s.videos);

  if (userId && allVideos.length > 0) {
    const progressList = await getUserProgressForVideos(
      userId,
      allVideos.map((v) => v.id)
    );
    const progressMap = new Map(progressList.map((p) => [p.video_id, p]));

    let previousCompleted = true; // First video is unlocked implicitly
    for (const v of allVideos) {
      const prog = progressMap.get(v.id);
      v.is_completed = prog?.is_completed ?? false;
      v.is_locked = !previousCompleted;
      previousCompleted = v.is_completed;
    }
  } else {
    let first = true;
    for (const v of allVideos) {
      v.is_completed = false;
      v.is_locked = !first;
      first = false;
    }
  }

  return subject;
}
