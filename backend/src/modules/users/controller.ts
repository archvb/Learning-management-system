import { Request, Response } from "express";
import { getMyProfile } from "./service";

export async function getMeController(
  req: Request,
  res: Response
): Promise<void> {
  const userIdRaw = req.user?.userId;
  if (!userIdRaw) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = Number(userIdRaw);

  try {
    const user = await getMyProfile(userId);
    res.status(200).json({ user });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status ?? 500).json({ error: error.message });
  }
}
