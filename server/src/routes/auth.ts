import { Router, RequestHandler } from "express";
import { register, login, logout, me, refresh } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register as RequestHandler);
router.post("/login", login as RequestHandler);
router.post("/logout", logout as RequestHandler);
router.post("/refresh", refresh);
router.get("/me", authenticateToken, me);


export default router;
