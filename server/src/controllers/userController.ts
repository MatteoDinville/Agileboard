import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

/**
 * GET /api/user/profile
 * Récupère le profil de l'utilisateur connecté
 */
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.userId!;

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
				updatedAt: true,
				// Ne pas inclure le mot de passe
			},
		});

		if (!user) {
			return res.status(404).json({ error: "Utilisateur non trouvé." });
		}

		res.json(user);
	} catch (err) {
		next(err);
	}
};

/**
 * PUT /api/user/profile
 * Met à jour le profil de l'utilisateur connecté
 * Corps attendu : { name?: string, email?: string }
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.userId!;
		const { name, email } = req.body;

		// Validation de base
		if (!name && !email) {
			return res.status(400).json({ error: "Au moins un champ (nom ou email) doit être fourni." });
		}

		// Si l'email est fourni, vérifier qu'il n'est pas déjà utilisé par un autre utilisateur
		if (email) {
			const existingUser = await prisma.user.findUnique({
				where: { email },
			});

			if (existingUser && existingUser.id !== userId) {
				return res.status(409).json({ error: "Cet email est déjà utilisé par un autre utilisateur." });
			}

			// Validation format email basique
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return res.status(400).json({ error: "Format d'email invalide." });
			}
		}

		// Mise à jour des données
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				...(name !== undefined && { name: name.trim() || null }),
				...(email !== undefined && { email: email.toLowerCase().trim() }),
			},
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		res.json({
			message: "Profil mis à jour avec succès.",
			user: updatedUser,
		});
	} catch (err) {
		next(err);
	}
};

/**
 * PUT /api/user/password
 * Change le mot de passe de l'utilisateur connecté
 * Corps attendu : { currentPassword: string, newPassword: string }
 */
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.userId!;
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({ error: "Mot de passe actuel et nouveau mot de passe requis." });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères." });
		}

		// Récupérer l'utilisateur avec son mot de passe
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			return res.status(404).json({ error: "Utilisateur non trouvé." });
		}

		// Vérifier le mot de passe actuel
		const passwordMatch = await bcrypt.compare(currentPassword, user.password);
		if (!passwordMatch) {
			return res.status(400).json({ error: "Mot de passe actuel incorrect." });
		}

		// Hasher le nouveau mot de passe
		const hashedNewPassword = await bcrypt.hash(newPassword, 10);

		// Mettre à jour le mot de passe
		await prisma.user.update({
			where: { id: userId },
			data: { password: hashedNewPassword },
		});

		res.json({ message: "Mot de passe modifié avec succès." });
	} catch (err) {
		next(err);
	}
};

/**
 * GET /api/user/all
 * Récupère la liste de tous les utilisateurs (pour ajouter des membres)
 */
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				// Ne pas inclure le mot de passe
			},
			orderBy: { name: "asc" }
		});

		res.json(users);
	} catch (err) {
		next(err);
	}
};
