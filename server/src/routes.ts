import { Router } from 'express'
import authRoutes from './api/auth/index'

const router = Router()

router.use('/auth', authRoutes)

export default router;
