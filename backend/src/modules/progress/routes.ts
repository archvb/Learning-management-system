import { Router } from "express";

const router = Router();

router.get("/:videoId", (req, res) => {
  res.send("Get video progress");
});

router.post("/", (req, res) => {
  res.send("Update progress");
});

export default router;