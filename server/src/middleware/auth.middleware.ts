import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import config from '../config'

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
		const token = req.cookies.token
		if (!token) throw createHttpError(401, 'Token manquant')
		const payload = jwt.verify(token, config.jwt.secret) as any
		req.user = { id: payload.userId, email: payload.email }
		next()
	} catch (err) {
		next(err)
	}
}
