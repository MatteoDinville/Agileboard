import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { authController } from "../../controllers/authController";

const prismaMock = vi.hoisted(() => ({
	user: {
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		findMany: vi.fn()
	}
}));
vi.mock("@prisma/client", () => ({ PrismaClient: vi.fn(() => prismaMock) }));

const bcryptMock = vi.hoisted(() => ({ hash: vi.fn(async () => "hashed"), compare: vi.fn(async () => true) }));
vi.mock("bcrypt", () => ({ default: bcryptMock }));

const jwtMock = vi.hoisted(() => ({ sign: vi.fn(() => "token"), verify: vi.fn(() => ({ sub: 1 })) }));
vi.mock("jsonwebtoken", () => ({ default: jwtMock }));

describe("authController", () => {
	let req: Partial<Request> & { cookies?: Record<string, string> };
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		vi.clearAllMocks();
		Object.values(prismaMock.user).forEach(fn => (fn).mockReset());
		bcryptMock.hash.mockReset?.();
		bcryptMock.compare.mockReset?.();
		jwtMock.sign.mockReset?.();
		jwtMock.verify.mockReset?.();
		bcryptMock.hash.mockResolvedValue("hashed");
		bcryptMock.compare.mockResolvedValue(true);

		req = { body: {}, cookies: {} };
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			cookie: vi.fn().mockReturnThis(),
			clearCookie: vi.fn().mockReturnThis()
		};
		next = vi.fn();
	});

	it("register - 400 missing credentials", async () => {
		await authController.register(req as Request, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("register - 409 email exists", async () => {
		req.body = { email: "a@a.com", password: "p" };
		prismaMock.user.findUnique.mockResolvedValue({ id: 1 });
		await authController.register(req as Request, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(409);
	});

	it("register - success", async () => {
		prismaMock.user.findUnique.mockResolvedValue(null);
		prismaMock.user.create.mockResolvedValue({ id: 1, email: "a@a.com", name: null, password: "hashed" });
		req.body = { email: "a@a.com", password: "p" };
		await authController.register(req as Request, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.cookie).toHaveBeenCalled();
	});

	it("login - 400 missing", async () => {
		await authController.login(req as Request, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("login - 401 user not found", async () => {
		prismaMock.user.findUnique.mockResolvedValue(null);
		req.body = { email: "a@a.com", password: "p" };
		await authController.login(req as Request, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it("login - 401 wrong password", async () => {
		prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: "a@a.com", password: "x" });
		bcryptMock.compare.mockResolvedValue(false);
		req.body = { email: "a@a.com", password: "p" };
		await authController.login(req as Request, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it("login - success", async () => {
		prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: "a@a.com", password: "x" });
		bcryptMock.compare.mockResolvedValue(true);
		req.body = { email: "a@a.com", password: "p" };
		await authController.login(req as Request, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.cookie).toHaveBeenCalled();
	});

	it("refresh - 401 missing token", () => {
		req.cookies = {};
		authController.refresh(req as Request, res as Response);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it("refresh - invalid token", async () => {
		jwtMock.verify.mockImplementationOnce(() => {
			throw new Error("bad");
		});
		req.cookies = { refresh_token: "x" };
		authController.refresh(req as Request, res as Response);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it("refresh - success", () => {
		jwtMock.verify.mockImplementationOnce(() => ({ sub: 1 }));
		req.cookies = { refresh_token: "x" };
		authController.refresh(req as Request, res as Response);
		expect(res.json).toHaveBeenCalledWith({ ok: true });
	});

	it("logout - clears cookies", async () => {
		await authController.logout(req as Request, res as Response);
		expect(res.clearCookie).toHaveBeenCalledTimes(2);
		expect(res.status).toHaveBeenCalledWith(200);
	});

	it("register - calls next on error (catch)", async () => {
		req.body = { email: "a@a.com", password: "p" };
		prismaMock.user.findUnique.mockResolvedValue(null);
		prismaMock.user.create.mockRejectedValue(new Error("db"));
		await authController.register(req as Request, res as Response, next);
		expect(next).toHaveBeenCalled();
	});

	it("login - calls next on error (catch)", async () => {
		req.body = { email: "a@a.com", password: "p" };
		prismaMock.user.findUnique.mockRejectedValue(new Error("db"));
		await authController.login(req as Request, res as Response, next);
		expect(next).toHaveBeenCalled();
	});

	it("refresh - 401 invalid payload shape", () => {
		jwtMock.verify.mockImplementationOnce(() => ({ sub: "abc" as unknown as number }));
		req.cookies = { refresh_token: "x" };
		authController.refresh(req as Request, res as Response);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it("refresh - 401 invalid sub", () => {
		jwtMock.verify.mockImplementationOnce(() => ({ sub: "abc" as unknown as number }));
		req.cookies = { refresh_token: "x" };
		authController.refresh(req as Request, res as Response);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it("me - 401 when no userId", async () => {
		const reqWithoutUserId = req as any;
		reqWithoutUserId.userId = undefined;
		await authController.me(reqWithoutUserId, res as Response);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it("me - 404 when user not found", async () => {
		(req as any).userId = 1;
		prismaMock.user.findUnique.mockResolvedValue(null);
		await authController.me(req as any, res as Response);
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it("me - 500 on error", async () => {
		(req as any).userId = 1;
		prismaMock.user.findUnique.mockRejectedValue(new Error("db"));
		await authController.me(req as any, res as Response);
		expect(res.status).toHaveBeenCalledWith(500);
	});

	it("me - 200 success", async () => {
		(req as any).userId = 1;
		prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: "a@a.com", name: null });
		await authController.me(req as any, res as Response);
		expect(res.status).toHaveBeenCalledWith(200);
	});
});
