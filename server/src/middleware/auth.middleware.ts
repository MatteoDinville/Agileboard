import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
	id: string;
	email: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.token;

	if (!token) {
		return res.status(401).json({ message: 'Non authentifié' });
	}

	if (!process.env.JWT_SECRET) {
		return res.status(500).json({ message: 'Erreur serveur : JWT_SECRET manquant' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

		req.user = {
			id: decoded.id,
			email: decoded.email,
			firstName: '',
			lastName: ''
		};

		next();
	} catch (error) {
		return res.status(401).json({ message: 'Token invalide' });
	}
};
