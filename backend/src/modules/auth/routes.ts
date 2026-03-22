import { Router } from "express";

const router = Router();

router.get("/signup", (req, res) => {
  res.send("Signup route");
});

router.get("/login", (req, res) => {
  res.send("Login route");
});

router.post("/logout", (req, res) => {
  res.send("Logout route");
});

router.post("/refresh", (req, res) => {
  res.send("Refresh route");
});

export default router;