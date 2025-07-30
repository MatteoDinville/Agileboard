import { Router, RequestHandler } from "express";
import { getProfile, updateProfile, changePassword, getAllUsers } from "../controllers/userController";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken as any);

// GET /api/user/profile - Récupérer le profil
router.get("/profile", getProfile as RequestHandler);

// GET /api/user/all - Récupérer tous les utilisateurs
router.get("/all", getAllUsers as RequestHandler);

// PUT /api/user/profile - Mettre à jour le profil (nom, email)
router.put("/profile", updateProfile as RequestHandler);

// PUT /api/user/password - Changer le mot de passe
router.put("/password", changePassword as RequestHandler);

export default router;
