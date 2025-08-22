import { Router } from "express";
import { projectController } from "../controllers/projectController.js";
import { invitationController } from "../controllers/invitationController";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Toutes ces routes nécessitent un JWT valide
router.use(authenticateToken);

// GET /api/projects               → liste des projets de l'utilisateur
router.get("/", projectController.getAllProjects);

// GET /api/projects/:id           → récupérer un projet spécifique
router.get("/:id", projectController.getProjectById);

// POST /api/projects              → créer un projet
router.post("/", projectController.createProject);

// PUT /api/projects/:id           → modifier un projet
router.put("/:id", projectController.updateProject);

// DELETE /api/projects/:id        → supprimer un projet
router.delete("/:id", projectController.deleteProject);

// GET /api/projects/:id/members     → récupérer les membres d'un projet
router.get("/:id/members", projectController.getProjectMembers);

// POST /api/projects/:id/members    → ajouter un membre à un projet
router.post("/:id/members", projectController.addProjectMember);

// DELETE /api/projects/:id/members/:userId → supprimer un membre d'un projet
router.delete("/:id/members/:userId", projectController.removeProjectMember);

// POST /api/projects/:id/invite     → envoyer une invitation par email
router.post("/:id/invite", invitationController.sendInvitation);

// GET /api/projects/:id/invitations → récupérer les invitations en attente
router.get("/:id/invitations", invitationController.getProjectInvitations);

// GET /api/projects/:id/invitations/history → récupérer l'historique des invitations
router.get("/:id/invitations/history", invitationController.getProjectInvitationsHistory);

// DELETE /api/projects/:id/invitations/:invitationId → supprimer une invitation
router.delete("/:id/invitations/:invitationId", invitationController.deleteInvitation);

export default router;
