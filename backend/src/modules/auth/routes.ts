import { Router } from "express";
import {
  signupController,
  loginController,
  logoutController,
  refreshController,
} from "./controller";

const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.post("/refresh", refreshController);

export default router;