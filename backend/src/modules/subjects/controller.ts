import { Request, Response } from "express";
import { listSubjects, getSubject } from "./service";

export async function getSubjectsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const subjects = await listSubjects();
    res.status(200).json({ subjects });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status ?? 500).json({ error: error.message });
  }
}

export async function getSubjectBySlugController(
  req: Request,
  res: Response
): Promise<void> {
  const slug = req.params["slug"] as string;
  try {
    const subject = await getSubject(slug);
    res.status(200).json({ subject });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status ?? 500).json({ error: error.message });
  }
}
