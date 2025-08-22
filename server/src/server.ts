import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import userRoutes from "./routes/user.js";
import taskRoutes from "./routes/task.js";
import invitationRoutes from "./routes/invitation.js";
import {
	securityMiddleware,
	rateLimitMiddleware,
	loginRateLimit,
	corsOptions,
	validateContentType,
	validatePayloadSize
} from "./middleware/security.middleware.js";
import { logger, logError } from "./utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;

app.disable("x-powered-by");

app.use(securityMiddleware);
app.use(cors(corsOptions));
app.use(rateLimitMiddleware);
app.use(validateContentType);
app.use(validatePayloadSize);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.set("trust proxy", 1);

app.use("/api/auth", loginRateLimit, authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/invite", invitationRoutes);

app.get("/", async (req: Request, res: Response) => {
	res.json({ message: "API en fonctionnement." });
});

app.get("/api/healthz", (_req, res) => res.json({ ok: true }));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	logError(err, { url: _req.url, method: _req.method, ip: _req.ip });
	const message = err instanceof Error ? err.message : "Erreur serveur";
	res.status(500).json({ error: message });
});

app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: "Route non trouvée" });
});

app.listen(PORT, () => {
	logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
});
