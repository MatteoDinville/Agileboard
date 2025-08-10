import request from 'supertest'
import express from 'express'
import userRoutes from '../../routes/user'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../../controllers/userController', () => ({
	getProfile: (req: any, res: any) => res.json({ id: 1 }),
	updateProfile: (req: any, res: any) => res.json({ id: 1 }),
	changePassword: (req: any, res: any) => res.json({ ok: true }),
	getAllUsers: (req: any, res: any) => res.json([{ id: 1 }]),
}))

vi.mock('../../middleware/auth.middleware', () => ({
	authenticateToken: (req: any, _res: any, next: any) => { req.userId = 1; next() }
}))

describe('user routes', () => {
	const app = express()
	app.use(express.json())
	app.use('/api/user', userRoutes)

	it('GET /profile', async () => {
		const res = await request(app).get('/api/user/profile')
		expect(res.status).toBe(200)
	})
	it('GET /all', async () => {
		const res = await request(app).get('/api/user/all')
		expect(res.status).toBe(200)
	})
	it('PUT /profile', async () => {
		const res = await request(app).put('/api/user/profile').send({ name: 'x' })
		expect(res.status).toBe(200)
	})
	it('PUT /password', async () => {
		const res = await request(app).put('/api/user/password').send({ currentPassword: 'a', newPassword: 'b' })
		expect(res.status).toBe(200)
	})
})



