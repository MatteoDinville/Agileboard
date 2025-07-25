import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme_pour_la_prod";

function generateToken(userId: number) {
	return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password, name } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: "Email et mot de passe requis." });
		}
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return res.status(409).json({ error: "Email déjà utilisé." });
		}
		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name: name ?? null,
			},
		});

		const token = generateToken(newUser.id);

		res.status(201).json({
			message: "Utilisateur créé avec succès.",
			user: { id: newUser.id, email: newUser.email, name: newUser.name },
			token: token,
		});
	} catch (err) {
		next(err);
	}
};

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

		res.status(200).json({
			message: "Connexion réussie.",
			user: { id: user.id, email: user.email, name: user.name },
			token: token,
		});
	} catch (err) {
		next(err);
	}
};

export const logout = async (req: Request, res: Response) => {
	res.status(200).json({ message: "Déconnexion réussie." });
};
