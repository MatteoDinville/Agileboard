import { Router, RequestHandler } from "express";
import {
	getAllProjects,
	getProjectById,
	createProject,
	updateProject,
	deleteProject,
	getProjectMembers,
	addProjectMember,
	removeProjectMember,
} from "../controllers/projectController";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Toutes ces routes nécessitent un JWT valide
router.use(authenticateToken as RequestHandler);

// GET /api/projects               → liste des projets de l'utilisateur
router.get("/", getAllProjects as RequestHandler);

// GET /api/projects/:id           → récupérer un projet spécifique
router.get("/:id", getProjectById as RequestHandler);

// POST /api/projects              → créer un projet
router.post("/", createProject as RequestHandler);

// PUT /api/projects/:id           → modifier un projet
router.put("/:id", updateProject as RequestHandler);

// DELETE /api/projects/:id        → supprimer un projet
router.delete("/:id", deleteProject as RequestHandler);

// GET /api/projects/:id/members     → récupérer les membres d'un projet
router.get("/:id/members", getProjectMembers as RequestHandler);

// POST /api/projects/:id/members    → ajouter un membre à un projet
router.post("/:id/members", addProjectMember as RequestHandler);

// DELETE /api/projects/:id/members/:userId → supprimer un membre d'un projet
router.delete("/:id/members/:userId", removeProjectMember as RequestHandler);

export default router;
