import { Router } from "express";
import {
  getSubjectsController,
  getSubjectBySlugController,
} from "./controller";
import { getSubjectContentController } from "../sections/controller";
import { optionalAuth } from "../../middleware/auth";

const router = Router();

router.get("/", getSubjectsController);
router.get("/:slug", getSubjectBySlugController);
router.get("/:slug/content", optionalAuth, getSubjectContentController);

export default router;