import { Router } from "express";
import { getVideoController } from "./controller";
import { optionalAuth } from "../../middleware/auth";

const router = Router();

router.get("/:id", optionalAuth, getVideoController);

export default router;