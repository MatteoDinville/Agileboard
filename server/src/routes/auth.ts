import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/me", authenticateToken, authController.me);


export default router;
