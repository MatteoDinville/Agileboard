import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/project";
import userRoutes from "./routes/user";
import taskRoutes from "./routes/task";
import invitationRoutes from "./routes/invitation";
import { PrismaClient } from "@prisma/client";
import { emailService } from "./services/emailService";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT ?? 4000;

app.use(cors({
	origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
	credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/invite", invitationRoutes);
app.get("/", async (req: Request, res: Response) => {
	res.json({ message: "API en fonctionnement." });
});

emailService.verifyConnection().catch(console.warn);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error(err);
	res.status(err.status ?? 500).json({ error: err.message ?? "Erreur serveur" });
});

app.listen(PORT, () => {
	console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
