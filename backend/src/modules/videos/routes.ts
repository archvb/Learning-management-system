import { Router } from "express";

const router = Router();

router.get("/:id", (req, res) => {
  res.send("Get video details");
});

export default router;