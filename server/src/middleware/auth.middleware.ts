import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme_pour_la_prod"

export interface AuthenticatedUser {
	id: string
	email: string
}

declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser
		}
	}
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
	try {
		const token = req.cookies.authToken
		if (!token) throw createHttpError(401, 'Token manquant')
		const payload = jwt.verify(token, JWT_SECRET) as any
		req.user = { id: payload.userId, email: payload.email }
		next()
	} catch (err) {
		next(err)
	}
}
