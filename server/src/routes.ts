import { Router } from 'express'
import authRoutes from './api/auth/index'

const router = Router()

router.use('/api/auth', authRoutes)

export default router;
