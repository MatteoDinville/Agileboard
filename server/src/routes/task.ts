import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { taskController } from "../controllers/taskController";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les tâches d'un projet
router.get("/project/:projectId", taskController.getProjectTasks);
router.post("/project/:projectId", taskController.createTask);

// Routes pour une tâche spécifique
router.put("/:taskId", taskController.updateTask);
router.delete("/:taskId", taskController.deleteTask);
router.patch("/:taskId/status", taskController.updateTaskStatus);

export default router;