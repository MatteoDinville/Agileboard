import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import projectRoutes from "../../routes/project";
import { describe, it, expect, vi } from "vitest";
import { AuthRequest } from "../../middleware/auth.middleware";

vi.mock("../../controllers/projectController", () => ({
	projectController: {
		getAllProjects: (req: Request, res: Response) => res.json([]),
		getProjectById: (req: Request, res: Response) => res.json({ id: 1 }),
		createProject: (req: Request, res: Response) => res.status(201).json({ id: 1 }),
		updateProject: (req: Request, res: Response) => res.json({ id: 1 }),
		deleteProject: (req: Request, res: Response) => res.status(204).send(),
		getProjectMembers: (req: Request, res: Response) => res.json([]),
		addProjectMember: (req: Request, res: Response) => res.status(201).json({ id: 1 }),
		removeProjectMember: (req: Request, res: Response) => res.status(204).send()
	}
}));

vi.mock("../../middleware/auth.middleware", () => ({
	authenticateToken: (req: Request, _res: Response, next: NextFunction) => {
		(req as AuthRequest).userId = 1;
		next();
	}
}));

describe("project routes", () => {
	const app = express();
	app.use(express.json());
	app.use("/api/projects", projectRoutes);

	it("GET /", async () => {
		const res = await request(app).get("/api/projects");
		expect(res.status).toBe(200);
	});
	it("GET /:id", async () => {
		const res = await request(app).get("/api/projects/1");
		expect(res.status).toBe(200);
	});
	it("POST /", async () => {
		const res = await request(app).post("/api/projects").send({ title: "x" });
		expect(res.status).toBe(201);
	});
	it("PUT /:id", async () => {
		const res = await request(app).put("/api/projects/1").send({ title: "y" });
		expect(res.status).toBe(200);
	});
	it("DELETE /:id", async () => {
		const res = await request(app).delete("/api/projects/1");
		expect(res.status).toBe(204);
	});
	it("GET /:id/members", async () => {
		const res = await request(app).get("/api/projects/1/members");
		expect(res.status).toBe(200);
	});
	it("POST /:id/members", async () => {
		const res = await request(app).post("/api/projects/1/members").send({ userId: 2 });
		expect(res.status).toBe(201);
	});
	it("DELETE /:id/members/:userId", async () => {
		const res = await request(app).delete("/api/projects/1/members/2");
		expect(res.status).toBe(204);
	});
});
