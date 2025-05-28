import express from 'express';
import * as controller from './project.controller';
import { authenticate } from '../../middleware/auth.middleware';
const router = express.Router();

router.use(authenticate);

router.get('/', controller.allProjects);
router.get('/:id', controller.projectById);
router.post('/create', controller.createProject);
router.put('/:id', controller.updateProject);
router.delete('/:id', controller.deleteProject);
router.post('/add-user', controller.addUserToProject);
router.post('/remove-user', controller.removeUserFromProject);
router.put('/:projectId/members/:memberId/role', controller.updateMemberRole);

export default router;
