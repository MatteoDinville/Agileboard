import { Router } from 'express'
import authRoutes from './api/auth'
import projectRoutes from './api/project'

const router = Router()

router.use('/auth', authRoutes)
router.use('/projects', projectRoutes)

export default router;
