import { Router } from "express";

const router = Router();

router.get("/:subjectId", (req, res) => {
  res.send("Get sections by subject");
});

export default router;