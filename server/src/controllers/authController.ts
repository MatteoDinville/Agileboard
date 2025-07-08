import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme_pour_la_prod";

// Fonction utilitaire pour créer un token
function generateToken(userId: number) {
	return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// Enregistrement d'un utilisateur
export const register = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password, name } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: "Email et mot de passe requis." });
		}
		// Vérifier si l'utilisateur existe déjà
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return res.status(409).json({ error: "Email déjà utilisé." });
		}
		// Hasher le mot de passe
		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name: name ?? null,
			},
		});

		const token = generateToken(newUser.id);

		// Stocker le token dans un cookie httpOnly
		res.cookie('authToken', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
		});

		res.status(201).json({
			message: "Utilisateur créé avec succès.",
			user: { id: newUser.id, email: newUser.email, name: newUser.name },
		});
	} catch (err) {
		next(err);
	}
};

// Connexion d'un utilisateur
export const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: "Email et mot de passe requis." });
		}
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(401).json({ error: "Email ou mot de passe invalide." });
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return res.status(401).json({ error: "Email ou mot de passe invalide." });
		}
		const token = generateToken(user.id);

		// Stocker le token dans un cookie httpOnly
		res.cookie('authToken', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
		});

		res.status(200).json({
			message: "Connexion réussie.",
			user: { id: user.id, email: user.email, name: user.name },
		});
	} catch (err) {
		next(err);
	}
};

// Déconnexion d'un utilisateur
export const logout = async (req: Request, res: Response) => {
	res.clearCookie('authToken');
	res.status(200).json({ message: "Déconnexion réussie." });
};
