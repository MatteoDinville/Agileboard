import request from 'supertest'
import express from 'express'
import projectRoutes from '../../routes/project'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../../controllers/projectController', () => ({
	projectController: {
		getAllProjects: (req: any, res: any) => res.json([]),
		getProjectById: (req: any, res: any) => res.json({ id: 1 }),
		createProject: (req: any, res: any) => res.status(201).json({ id: 1 }),
		updateProject: (req: any, res: any) => res.json({ id: 1 }),
		deleteProject: (req: any, res: any) => res.status(204).send(),
		getProjectMembers: (req: any, res: any) => res.json([]),
		addProjectMember: (req: any, res: any) => res.status(201).json({ id: 1 }),
		removeProjectMember: (req: any, res: any) => res.status(204).send(),
	}
}))

vi.mock('../../middleware/auth.middleware', () => ({
	authenticateToken: (req: any, _res: any, next: any) => { req.userId = 1; next() }
}))

describe('project routes', () => {
	const app = express()
	app.use(express.json())
	app.use('/api/projects', projectRoutes)

	it('GET /', async () => {
		const res = await request(app).get('/api/projects')
		expect(res.status).toBe(200)
	})
	it('GET /:id', async () => {
		const res = await request(app).get('/api/projects/1')
		expect(res.status).toBe(200)
	})
	it('POST /', async () => {
		const res = await request(app).post('/api/projects').send({ title: 'x' })
		expect(res.status).toBe(201)
	})
	it('PUT /:id', async () => {
		const res = await request(app).put('/api/projects/1').send({ title: 'y' })
		expect(res.status).toBe(200)
	})
	it('DELETE /:id', async () => {
		const res = await request(app).delete('/api/projects/1')
		expect(res.status).toBe(204)
	})
	it('GET /:id/members', async () => {
		const res = await request(app).get('/api/projects/1/members')
		expect(res.status).toBe(200)
	})
	it('POST /:id/members', async () => {
		const res = await request(app).post('/api/projects/1/members').send({ userId: 2 })
		expect(res.status).toBe(201)
	})
	it('DELETE /:id/members/:userId', async () => {
		const res = await request(app).delete('/api/projects/1/members/2')
		expect(res.status).toBe(204)
	})
})
