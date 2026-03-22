import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Get all subjects");
});

router.get("/:slug", (req, res) => {
  res.send("Get subject by slug");
});

export default router;