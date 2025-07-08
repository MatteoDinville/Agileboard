import { Router, RequestHandler } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
	getProjectTasks,
	createTask,
	updateTask,
	deleteTask,
	updateTaskStatus
} from "../controllers/taskController";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken as RequestHandler);

// Routes pour les tâches d'un projet
router.get("/project/:projectId", getProjectTasks as RequestHandler);
router.post("/project/:projectId", createTask as RequestHandler);

// Routes pour une tâche spécifique
router.put("/:taskId", updateTask as RequestHandler);
router.delete("/:taskId", deleteTask as RequestHandler);
router.patch("/:taskId/status", updateTaskStatus as RequestHandler);

export default router;
