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

	if (!token) token = (req as any).cookies?.["access_token"];

	if (!token) return res.status(401).json({ error: "Token manquant." });

	jwt.verify(token, JWT_ACCESS_SECRET, (err, payload) => {
		if (err) return res.status(401).json({ error: "Token invalide ou expiré." });

		if (
			typeof payload === "object" &&
			payload !== null &&
			"sub" in payload &&
			typeof payload.sub === "number"
		) {
			req.userId = payload.sub;
			next();
		} else {
			return res.status(401).json({ error: "Payload invalide." });
		}
	});
};
