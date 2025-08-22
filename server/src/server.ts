import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import userRoutes from "./routes/user.js";
import taskRoutes from "./routes/task.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(
	cors({
		origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
		credentials: true
	})
);
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error("[API ERROR]", err);
	const message = err instanceof Error ? err.message : "Erreur serveur";
	res.status(500).json({ error: message });
});

app.get("/api/healthz", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
	console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
