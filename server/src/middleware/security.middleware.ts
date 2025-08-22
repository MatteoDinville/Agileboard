import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

export const securityMiddleware = helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			scriptSrc: ["'self'"],
			imgSrc: ["'self'", "data:", "https:"],
			connectSrc: ["'self'"],
			fontSrc: ["'self'"],
			objectSrc: ["'none'"],
			mediaSrc: ["'self'"],
			frameSrc: ["'none'"]
		}
	},
	hsts: {
		maxAge: 31536000,
		includeSubDomains: true,
		preload: true
	},
	noSniff: true,
	xssFilter: true,
	frameguard: {
		action: "deny"
	},
	hidePoweredBy: true
});

export const rateLimitMiddleware = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
	standardHeaders: true,
	legacyHeaders: false
});

export const loginRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true
});

export const corsOptions = {
	origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
	allowedHeaders: ["Content-Type", "Authorization"],
	exposedHeaders: ["Set-Cookie"]
};

export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
	if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
		const contentType = req.headers["content-type"];
		if (!contentType || !contentType.includes("application/json")) {
			return res.status(400).json({ error: "Content-Type doit être application/json" });
		}
	}
	next();
};

export const validatePayloadSize = (req: Request, res: Response, next: NextFunction) => {
	const contentLength = parseInt(req.headers["content-length"] || "0");
	const maxSize = 1024 * 1024;

	if (contentLength > maxSize) {
		return res.status(413).json({ error: "Payload trop volumineux" });
	}
	next();
};
