import request from 'supertest'
import express from 'express'
import taskRoutes from '../../routes/task'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../../controllers/taskController', () => ({
	taskController: {
		getProjectTasks: (req: any, res: any) => res.json([]),
		createTask: (req: any, res: any) => res.status(201).json({ id: 1 }),
		updateTask: (req: any, res: any) => res.json({ id: 1 }),
		deleteTask: (req: any, res: any) => res.json({ ok: true }),
		updateTaskStatus: (req: any, res: any) => res.json({ id: 1 }),
	}
}))

vi.mock('../../middleware/auth.middleware', () => ({
	authenticateToken: (req: any, _res: any, next: any) => { req.userId = 1; next() }
}))

describe('task routes', () => {
	const app = express()
	app.use(express.json())
	app.use('/api/tasks', taskRoutes)

	it('GET /project/:projectId', async () => {
		const res = await request(app).get('/api/tasks/project/1')
		expect(res.status).toBe(200)
	})
	it('POST /project/:projectId', async () => {
		const res = await request(app).post('/api/tasks/project/1').send({ title: 't' })
		expect(res.status).toBe(201)
	})
	it('PUT /:taskId', async () => {
		const res = await request(app).put('/api/tasks/1').send({ title: 'n' })
		expect(res.status).toBe(200)
	})
	it('DELETE /:taskId', async () => {
		const res = await request(app).delete('/api/tasks/1')
		expect(res.status).toBe(200)
	})
	it('PATCH /:taskId/status', async () => {
		const res = await request(app).patch('/api/tasks/1/status').send({ status: 'En cours' })
		expect(res.status).toBe(200)
	})
})



