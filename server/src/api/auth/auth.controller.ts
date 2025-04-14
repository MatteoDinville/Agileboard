import { Request, Response } from 'express'
import * as authService from './auth.service'

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body

		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required' })
		}

		const result = await authService.login(email, password)
		res.status(200).json(result)
	} catch (error: any) {
		const statusCode = error.statusCode || 401
		const message = error.message || 'Authentication failed'
		res.status(statusCode).json({ message })
	}
}

export const register = async (req: Request, res: Response) => {
	try {
		const { email, password, firstName, lastName } = req.body
		const result = await authService.register(email, password, firstName, lastName)
		res.status(201).json(result)
	} catch (error: any) {
		res.status(400).json({ message: error.message })
	}
}

// TEMP : à implémenter plus tard
export const me = (req: Request, res: Response) => {
	res.status(200).json({ message: "User info here" })
}

export const logout = (req: Request, res: Response) => {
	res.clearCookie('token')
	res.status(200).json({ message: "Logged out" })

}

export const refresh = (req: Request, res: Response) => {
	res.status(200).json({ message: "Token refreshed" })
}

export const verify = (req: Request, res: Response) => {
	res.status(200).json({ message: "Verification link sent" })
}

export const verifyToken = (req: Request, res: Response) => {
	res.status(200).json({ message: "Token verified", token: req.params.token })
}
