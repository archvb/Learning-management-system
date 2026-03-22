import { Request, Response } from "express";
import { fetchProgress, saveProgress } from "./service";

export async function getProgressController(
  req: Request,
  res: Response
): Promise<void> {
  const userIdRaw = req.user?.userId;
  if (!userIdRaw) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = Number(userIdRaw);

  const videoId = req.params["videoId"] as string;

  try {
    const progress = await fetchProgress(userId, videoId);
    if (!progress) {
      res.status(200).json({ progress: null });
      return;
    }
    res.status(200).json({ progress });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status ?? 500).json({ error: error.message });
  }
}

export async function upsertProgressController(
  req: Request,
  res: Response
): Promise<void> {
  const userIdRaw = req.user?.userId;
  if (!userIdRaw) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = Number(userIdRaw);

  const { video_id, last_position_seconds, is_completed } = req.body as {
    video_id: string;
    last_position_seconds: number;
    is_completed: boolean;
  };

  if (
    !video_id ||
    last_position_seconds === undefined ||
    is_completed === undefined
  ) {
    res
      .status(400)
      .json({ error: "video_id, last_position_seconds, and is_completed are required" });
    return;
  }

  try {
    const progress = await saveProgress(
      userId,
      video_id,
      last_position_seconds,
      is_completed
    );
    res.status(200).json({ progress });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status ?? 500).json({ error: error.message });
  }
}
