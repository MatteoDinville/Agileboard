import { Request, Response } from 'express'
import * as authService from './auth.service'
import jwt from 'jsonwebtoken';

interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
}

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required' });
		}

		const result = await authService.login(email, password);

		const token = jwt.sign({ id: result.userId }, process.env.JWT_SECRET!, {
			expiresIn: '1d',
		});

		res.cookie('token', token, {
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 24 * 60 * 60 * 1000, // 1 jour
		});

		res.status(200).json({
			message: result.message,
			firstName: result.firstName,
			lastName: result.lastName,
		});
		console.log(result);
	} catch (error: any) {
		const statusCode = error.statusCode || 401;
		const message = error.message || 'Authentication failed';
		res.status(statusCode).json({ message });
	}
};


export const register = async (req: Request, res: Response) => {
	try {
		const { email, password, firstName, lastName } = req.body
		const result = await authService.register(email, password, firstName, lastName)
		res.status(201).json(result)
	} catch (error: any) {
		res.status(400).json({ message: error.message })
	}
}

export const me = async (req: Request, res: Response) => {
	try {
		if (!req.user?.id) {
			return res.status(401).json({ message: "Non authentifié" });
		}
		const user = await authService.me(req.user.id);
		res.status(200).json(user);
	} catch (error: any) {
		res.status(500).json({ message: "Internal server error" });
	}
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
