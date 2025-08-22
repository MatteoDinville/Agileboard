import { Router } from "express";
import { invitationController } from "../controllers/invitationController.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/invite/:token → récupérer les informations d'une invitation
router.get("/:token", invitationController.getInvitation);

// POST /api/invite/:token/accept → accepter une invitation
router.post("/:token/accept", authenticateToken, invitationController.acceptInvitation);

// POST /api/invite/:token/decline → décliner une invitation
router.post("/:token/decline", authenticateToken, invitationController.declineInvitation);

export default router;
