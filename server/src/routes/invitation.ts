import { Router } from "express";
import { invitationController } from "../controllers/invitationController";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Routes publiques
// GET /api/invite/:token → récupérer les informations d'une invitation
router.get("/:token", invitationController.getInvitation);

// Routes protégées (nécessitent un JWT valide)
// POST /api/invite/:token/accept → accepter une invitation
router.post("/:token/accept", authenticateToken, invitationController.acceptInvitation);

export default router;
