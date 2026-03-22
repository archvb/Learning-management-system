import {
  getAllPublishedSubjects,
  getSubjectBySlug,
  SubjectRow,
} from "./repository";

export async function listSubjects(): Promise<SubjectRow[]> {
  return getAllPublishedSubjects();
}

export async function getSubject(slug: string): Promise<SubjectRow> {
  const subject = await getSubjectBySlug(slug);
  if (!subject) {
    throw Object.assign(new Error("Subject not found"), { status: 404 });
  }
  return subject;
}
