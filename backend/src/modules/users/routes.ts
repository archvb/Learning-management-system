import { Router } from "express";

const router = Router();

router.get("/me", (req, res) => {
  res.send("Get current user");
});

export default router;