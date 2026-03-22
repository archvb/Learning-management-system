import { Router } from "express";
import { getMeController } from "./controller";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/me", requireAuth, getMeController);

export default router;