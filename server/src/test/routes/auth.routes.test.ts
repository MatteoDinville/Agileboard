import request from "supertest";
import express, { Request, Response } from "express";
import authRoutes from "../../routes/auth";
import { describe, it, expect, vi } from "vitest";

vi.mock("../../controllers/authController", () => ({
	authController: {
		register: (req: Request, res: Response) => res.status(201).json({ ok: true }),
		login: (req: Request, res: Response) => res.status(200).json({ ok: true }),
		logout: (req: Request, res: Response) => res.status(200).json({ ok: true }),
		refresh: (req: Request, res: Response) => res.status(200).json({ ok: true }),
		me: (req: Request, res: Response) => res.status(200).json({ ok: true })
	}
}));

describe("auth routes", () => {
	const app = express();
	app.use(express.json());
	app.use("/api/auth", authRoutes);

	it("POST /register", async () => {
		const res = await request(app).post("/api/auth/register").send({});
		expect(res.status).toBe(201);
	});
	it("POST /login", async () => {
		const res = await request(app).post("/api/auth/login").send({});
		expect(res.status).toBe(200);
	});
	it("POST /logout", async () => {
		const res = await request(app).post("/api/auth/logout");
		expect(res.status).toBe(200);
	});
	it("POST /refresh", async () => {
		const res = await request(app).post("/api/auth/refresh");
		expect(res.status).toBe(200);
	});
});
