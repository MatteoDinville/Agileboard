import express from 'express';
import * as controller from './auth.controller';

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/me', controller.me);
router.get('/refresh', controller.refresh);
router.get('/verify', controller.verify);
router.get('/verify/:token', controller.verifyToken);


export default router;
