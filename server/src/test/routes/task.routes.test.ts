import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import taskRoutes from "../../routes/task";
import { describe, it, expect, vi } from "vitest";
import { AuthRequest } from "../../middleware/auth.middleware";

vi.mock("../../controllers/taskController", () => ({
	taskController: {
		getProjectTasks: (req: Request, res: Response) => res.json([]),
		createTask: (req: Request, res: Response) => res.status(201).json({ id: 1 }),
		updateTask: (req: Request, res: Response) => res.json({ id: 1 }),
		deleteTask: (req: Request, res: Response) => res.json({ ok: true }),
		updateTaskStatus: (req: Request, res: Response) => res.json({ id: 1 })
	}
}));

vi.mock("../../middleware/auth.middleware", () => ({
	authenticateToken: (req: Request, _res: Response, next: NextFunction) => {
		(req as AuthRequest).userId = 1;
		next();
	}
}));

describe("task routes", () => {
	const app = express();
	app.use(express.json());
	app.use("/api/tasks", taskRoutes);

	it("GET /project/:projectId", async () => {
		const res = await request(app).get("/api/tasks/project/1");
		expect(res.status).toBe(200);
	});
	it("POST /project/:projectId", async () => {
		const res = await request(app).post("/api/tasks/project/1").send({ title: "t" });
		expect(res.status).toBe(201);
	});
	it("PUT /:taskId", async () => {
		const res = await request(app).put("/api/tasks/1").send({ title: "n" });
		expect(res.status).toBe(200);
	});
	it("DELETE /:taskId", async () => {
		const res = await request(app).delete("/api/tasks/1");
		expect(res.status).toBe(200);
	});
	it("PATCH /:taskId/status", async () => {
		const res = await request(app).patch("/api/tasks/1/status").send({ status: "En cours" });
		expect(res.status).toBe(200);
	});
});
