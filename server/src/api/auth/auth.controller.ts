import { CookieOptions, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { sign, type Secret, type SignOptions } from 'jsonwebtoken'
import * as authService from './auth.service'
import config from '../../config'

export const register = async (req: Request, res: Response) => {
	const { email, password, firstName, lastName } = req.body
	const user = await authService.register(email, password, firstName, lastName)
	res.status(201).json(user)
}

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body
	if (!email || !password) throw createHttpError(400, 'Email et mot de passe requis')

	const user = await authService.login(email, password)

	const payload = { userId: user.id, email: user.email }
	const secret: Secret = config.jwt.secret
	const options: SignOptions = { expiresIn: config.jwt.expiresIn }

	const token = sign(payload, secret, options)
	res
		.cookie('token', token, config.jwt.cookie as CookieOptions)
		.status(200)
		.json({ firstName: user.firstName, lastName: user.lastName })
}

export const logout = async (_req: Request, res: Response) => {
	res.clearCookie('token').status(200).json({ message: 'Déconnecté' })
}

export const me = async (req: Request, res: Response) => {
	if (!req.user) throw createHttpError(401, 'Non authentifié')
	const user = await authService.getById(req.user.id)
	res.status(200).json(user)
}

export const updateProfile = async (req: Request, res: Response) => {
	if (!req.user) throw createHttpError(401, 'Non authentifié')
	const { firstName, lastName, email } = req.body
	const updated = await authService.updateProfile(req.user.id, { firstName, lastName, email })
	res.status(200).json(updated)
}
