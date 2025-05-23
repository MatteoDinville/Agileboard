import express from 'express';
import * as controller from './project.controller';
const router = express.Router();

router.post('/', controller.allProjects);
router.post('/:id', controller.projectById);
router.post('/create', controller.createProject);
router.put('/:id', controller.updateProject);
router.delete('/:id', controller.deleteProject);
router.post('/add-user', controller.addUserToProject);
router.post('/remove-user', controller.removeUserFromProject);

export default router;
