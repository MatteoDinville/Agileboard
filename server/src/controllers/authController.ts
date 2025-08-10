import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthRequest } from "../middleware/auth.middleware";

dotenv.config();
const prisma = new PrismaClient();

/* c8 ignore next 2 */
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "change-me-access";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "change-me-refresh";

const ACCESS_TTL = "15m";
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOpts(maxAgeMs: number) {
	const isProd = process.env.NODE_ENV === "production";
	return {
		httpOnly: true as const,
		secure: isProd,
		/* c8 ignore next */
		sameSite: isProd ? ("none" as const) : ("lax" as const),
		path: "/",
		maxAge: maxAgeMs,
	};
}

function signAccessToken(userId: number) {
	return jwt.sign({ sub: userId }, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}
function signRefreshToken(userId: number) {
	return jwt.sign({ sub: userId }, JWT_REFRESH_SECRET, { expiresIn: Math.floor(REFRESH_TTL_MS / 1000) });
}

export const authController = {
	register: async (req: Request, res: Response, next: NextFunction) => {
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

			const access = signAccessToken(newUser.id);
			const refresh = signRefreshToken(newUser.id);

			res.cookie("access_token", access, cookieOpts(15 * 60 * 1000));
			res.cookie("refresh_token", refresh, cookieOpts(REFRESH_TTL_MS));

			res.status(201).json({
				message: "Utilisateur créé avec succès.",
				user: { id: newUser.id, email: newUser.email, name: newUser.name ?? undefined },
			});
		} catch (err) {
			next(err);
		}
	},

	login: async (req: Request, res: Response, next: NextFunction) => {
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
			const access = signAccessToken(user.id);
			const refresh = signRefreshToken(user.id);

			res.cookie("access_token", access, cookieOpts(15 * 60 * 1000));
			res.cookie("refresh_token", refresh, cookieOpts(REFRESH_TTL_MS));

			res.status(200).json({
				message: "Connexion réussie.",
				user: { id: user.id, email: user.email, name: user.name ?? undefined },
			});
		} catch (err) {
			next(err);
		}
	},

	refresh: (req: Request, res: Response) => {
		const token = (req as any).cookies?.["refresh_token"];
		if (!token) return res.status(401).json({ error: "Refresh token manquant." });

		try {
			const payload = jwt.verify(token, JWT_REFRESH_SECRET);
			if (typeof payload !== "object" || payload === null || typeof (payload as any).sub === "undefined") {
				return res.status(401).json({ error: "Refresh token invalide." });
			}

			const userId = typeof (payload as any).sub === "string" ? parseInt((payload as any).sub, 10) : (payload as any).sub;
			if (typeof userId !== "number" || isNaN(userId)) {
				return res.status(401).json({ error: "Refresh token invalide." });
			}

			const newAccess = signAccessToken(userId);
			const newRefresh = signRefreshToken(userId);

			res.cookie("access_token", newAccess, cookieOpts(15 * 60 * 1000));
			res.cookie("refresh_token", newRefresh, cookieOpts(REFRESH_TTL_MS));

			return res.json({ ok: true });
		} catch {
			return res.status(401).json({ error: "Refresh token invalide." });
		}
	},

	logout: async (_req: Request, res: Response) => {
		res.clearCookie("access_token", { path: "/" });
		res.clearCookie("refresh_token", { path: "/" });
		res.status(200).json({ message: "Déconnexion réussie." });
	},

	me: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.userId;
			if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié." });

			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { id: true, email: true, name: true },
			});

			if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });

			res.status(200).json({ user: { id: user.id, email: user.email, name: user.name ?? undefined } });
		} catch {
			res.status(500).json({ error: "Erreur serveur." });
		}
	},
};
