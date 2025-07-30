import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { taskController } from "../controllers/taskController";

const router = Router();

router.use(authenticateToken);

router.get("/project/:projectId", taskController.getProjectTasks);
router.post("/project/:projectId", taskController.createTask);

router.put("/:taskId", taskController.updateTask);
router.delete("/:taskId", taskController.deleteTask);
router.patch("/:taskId/status", taskController.updateTaskStatus);

export default router;