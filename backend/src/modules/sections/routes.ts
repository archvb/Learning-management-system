import { Router } from "express";
import { getSubjectContentController } from "./controller";

const router = Router();

// Mounted under /subjects via subjects/routes.ts
// This router provides standalone access if needed
router.get("/:slug/content", getSubjectContentController);

export default router;