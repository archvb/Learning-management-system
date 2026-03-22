import { db } from "../../config/db";

export interface SubjectRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  published: boolean;
  created_at: Date;
}

export async function getAllPublishedSubjects(): Promise<SubjectRow[]> {
  const result = await db.query<SubjectRow>(
    `SELECT id, title, slug, description, thumbnail_url, published, created_at
     FROM subjects
     WHERE published = true
     ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function getSubjectBySlug(
  slug: string
): Promise<SubjectRow | null> {
  const result = await db.query<SubjectRow>(
    `SELECT id, title, slug, description, thumbnail_url, published, created_at
     FROM subjects
     WHERE slug = $1 AND published = true`,
    [slug]
  );
  return result.rows[0] ?? null;
}
