import express from 'express';
import * as controller from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/me', authMiddleware, controller.me);
router.get('/refresh', controller.refresh);
router.get('/verify', controller.verify);
router.get('/verify/:token', controller.verifyToken);


export default router;
