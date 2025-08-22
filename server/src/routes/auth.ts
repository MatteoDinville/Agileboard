import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/me", authenticateToken, authController.me);

export default router;
