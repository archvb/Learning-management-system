import { Router } from "express";
import {
  getProgressController,
  upsertProgressController,
} from "./controller";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/:videoId", requireAuth, getProgressController);
router.post("/", requireAuth, upsertProgressController);

export default router;