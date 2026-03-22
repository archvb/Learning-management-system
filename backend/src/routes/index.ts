import { Router } from "express";
import authRoutes from "../modules/auth/routes";
import userRoutes from "../modules/users/routes";
import subjectRoutes from "../modules/subjects/routes";
import sectionRoutes from "../modules/sections/routes";
import videoRoutes from "../modules/videos/routes";
import progressRoutes from "../modules/progress/routes";

const router = Router();

router.get("/", (req, res) => {
  res.send("API Root 🚀");
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/subjects", subjectRoutes);
router.use("/sections", sectionRoutes);
router.use("/videos", videoRoutes);
router.use("/progress", progressRoutes);

export default router;