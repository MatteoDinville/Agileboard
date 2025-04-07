import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, Router } from 'express';

const router = Router();
const prisma = new PrismaClient();

router.post('/register', async (req: Request, res: Response) => {
	try {
		const { firstName, lastName, email, password } = req.body;

		const existingUser = await prisma.user.findUnique({
			where: { email }
		});

		if (existingUser) {
			return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.user.create({
			data: {
				firstName,
				lastName,
				email,
				password: hashedPassword
			}
		});

		res.status(201).json({ message: 'Utilisateur créé avec succès' });
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error instanceof Error ? error.message : 'Erreur inconnue' });
	}
});

router.post('/login', async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		const user = await prisma.user.findUnique({
			where: { email }
		});

		if (!user) {
			return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
		}


		const validPassword = await bcrypt.compare(password, user.password);

		if (!validPassword) {
			return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
		}

		const token = jwt.sign(
			{ userId: user.id },
			process.env.JWT_SECRET ?? 'your-secret-key',
			{ expiresIn: '24h' }
		);

		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 24 * 60 * 60 * 1000
		});

		res.json({ message: 'Connexion réussie' });
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Erreur lors de la connexion' });
	}
});

router.post('/logout', (req: Request, res: Response) => {
	res.clearCookie('token');
	res.json({ message: 'Déconnexion réussie' });
});

export const verifyToken = (req: Request, res: Response, next: Function) => {
	const token = req.cookies.token;

	if (!token) {
		return res.status(401).json({ message: 'Non authentifié' });
	}

	try {
		next();
	} catch (error) {
		res.status(401).json({ message: 'Token invalide' });
	}
};

router.get('/me', verifyToken, async (req: Request, res: Response) => {
	try {
		const token = req.cookies.token;
		if (!token) {
			return res.status(401).json({ message: 'Non authentifié' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'your-secret-key');
		const user = await prisma.user.findUnique({
			where: { id: (decoded as { userId: string }).userId },
			select: {
				firstName: true,
				lastName: true,
				email: true
			}
		});

		if (!user) {
			return res.status(404).json({ message: 'Utilisateur non trouvé' });
		}

		res.json(user);
	} catch (error) {
		console.error('Get user error:', error);
		res.status(500).json({ message: 'Erreur lors de la récupération des informations utilisateur' });
	}
});

export default router;
