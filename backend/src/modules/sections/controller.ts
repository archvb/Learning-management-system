import { Request, Response } from "express";
import { getSubjectContent } from "./service";

export async function getSubjectContentController(
  req: Request,
  res: Response
): Promise<void> {
  const slug = req.params["slug"] as string;
  try {
    const userId = req.user?.userId ? Number(req.user.userId) : undefined;
    const content = await getSubjectContent(slug, userId);
    res.status(200).json({ content });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status ?? 500).json({ error: error.message });
  }
}
