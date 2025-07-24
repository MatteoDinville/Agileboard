import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme_pour_la_prod";

export interface AuthRequest extends Request {
	userId?: number;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers["authorization"];
	let token = authHeader?.split(" ")[1];
	
	if (!token) {
		token = req.cookies?.authToken;
	}
	
	if (!token) return res.status(401).json({ error: "Token manquant." });

	jwt.verify(token, JWT_SECRET, (err, payload: any) => {
		if (err) return res.status(403).json({ error: "Token invalide ou expiré." });
		req.userId = payload.userId;
		next();
	});
};
