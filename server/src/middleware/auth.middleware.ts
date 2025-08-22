import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "change-me-access";

export interface AuthRequest extends Request {
	userId?: number;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers["authorization"];
	let token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

	if (!token) token = req.cookies?.["access_token"];

	if (!token) return res.status(401).json({ error: "Token manquant." });

	jwt.verify(token, JWT_ACCESS_SECRET, (err, payload) => {
		if (err) return res.status(401).json({ error: "Token invalide ou expiré." });

		if (typeof payload === "object" && payload !== null && "sub" in payload && typeof payload.sub === "number") {
			req.userId = payload.sub;
			next();
		} else {
			return res.status(401).json({ error: "Payload invalide." });
		}
	});
};

export const requireProjectAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
	const projectId = parseInt(req.params.projectId || req.body.projectId);
	const userId = req.userId;

	if (!projectId || !userId) {
		return res.status(400).json({ error: "ID de projet ou utilisateur manquant." });
	}

	try {
		const { PrismaClient } = await import("@prisma/client");
		const prisma = new PrismaClient();

		const projectMember = await prisma.projectMember.findFirst({
			where: {
				projectId,
				userId
			}
		});

		if (!projectMember) {
			return res.status(403).json({ error: "Accès refusé. Vous n'êtes pas membre de ce projet." });
		}

		next();
	} catch (error) {
		console.error("Erreur lors de la vérification d'accès au projet:", error);
		return res.status(500).json({ error: "Erreur lors de la vérification des permissions." });
	}
};

export const requireTaskAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
	const taskId = parseInt(req.params.taskId || req.body.taskId);
	const userId = req.userId;

	if (!taskId || !userId) {
		return res.status(400).json({ error: "ID de tâche ou utilisateur manquant." });
	}

	try {
		const { PrismaClient } = await import("@prisma/client");
		const prisma = new PrismaClient();

		const task = await prisma.task.findFirst({
			where: {
				id: taskId,
				project: {
					members: {
						some: {
							userId
						}
					}
				}
			}
		});

		if (!task) {
			return res.status(403).json({ error: "Accès refusé. Vous n'avez pas accès à cette tâche." });
		}

		next();
	} catch (error) {
		console.error("Erreur lors de la vérification d'accès à la tâche:", error);
		return res.status(500).json({ error: "Erreur lors de la vérification des permissions." });
	}
};
