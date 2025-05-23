import express from 'express';
import * as controller from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);

router.get('/me', authenticate, controller.me);
router.put('/update-profile', controller.updateProfile);


export default router;
