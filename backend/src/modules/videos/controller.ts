import { Request, Response } from "express";
import { getVideo } from "./service";

export async function getVideoController(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params["id"] as string;
  try {
    const userId = req.user?.userId ? Number(req.user.userId) : undefined;
    const result = await getVideo(id, userId);
    res.status(200).json(result);
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status ?? 500).json({ error: error.message });
  }
}
