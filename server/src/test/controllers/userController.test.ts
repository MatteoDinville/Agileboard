import { describe, it, expect, vi, beforeEach } from "vitest";
import { Response, NextFunction } from "express";
import { getProfile, updateProfile, changePassword, getAllUsers } from "../../controllers/userController";
import { AuthRequest } from "../../middleware/auth.middleware";

const prismaMock = vi.hoisted(() => ({ user: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn() } }));
vi.mock("@prisma/client", () => ({ PrismaClient: vi.fn(() => prismaMock) }));

const bcryptMock = vi.hoisted(() => ({ hash: vi.fn(async () => "hashed"), compare: vi.fn(async () => true) }));
vi.mock("bcrypt", () => ({ default: bcryptMock }));

describe("userController", () => {
	let req: Partial<AuthRequest>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		vi.clearAllMocks();
		Object.values(prismaMock.user).forEach((fn) => (fn as any).mockReset());
		bcryptMock.hash.mockReset?.();
		bcryptMock.compare.mockReset?.();
		bcryptMock.hash.mockResolvedValue("hashed");
		bcryptMock.compare.mockResolvedValue(true);
		req = { userId: 1, body: {}, params: {} };
		res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
		next = vi.fn();
	});

	it("getProfile - 404 when not found", async () => {
		prismaMock.user.findUnique.mockResolvedValue(null);
		await getProfile(req as AuthRequest, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it("getProfile - success", async () => {
		prismaMock.user.findUnique.mockResolvedValue({
			id: 1,
			email: "a@a.com",
			name: "A",
			createdAt: new Date(),
			updatedAt: new Date()
		});
		await getProfile(req as AuthRequest, res as Response, next);
		expect(res.json).toHaveBeenCalled();
	});

	it("getProfile - next on error", async () => {
		prismaMock.user.findUnique.mockRejectedValue(new Error("db"));
		await getProfile(req as AuthRequest, res as Response, next);
		expect(next).toHaveBeenCalled();
	});

	it("updateProfile - 400 when empty body", async () => {
		await updateProfile(req as AuthRequest, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("updateProfile - 409 when email taken by other", async () => {
		req.body = { email: "x@x.com" };
		prismaMock.user.findUnique.mockResolvedValue({ id: 2, email: "x@x.com" });
		await updateProfile(req as AuthRequest, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(409);
	});

	it("updateProfile - 400 when email invalid", async () => {
		prismaMock.user.findUnique.mockResolvedValue(null);
		req.body = { email: "bad" };
		await updateProfile(req as AuthRequest, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("updateProfile - success", async () => {
		req.body = { name: "New", email: "new@example.com" };
		prismaMock.user.findUnique.mockResolvedValue(null);
		prismaMock.user.update.mockResolvedValue({
			id: 1,
			email: "new@example.com",
			name: "New",
			createdAt: new Date(),
			updatedAt: new Date()
		});
		await updateProfile(req as AuthRequest, res as Response, next);
		expect(res.json).toHaveBeenCalled();
	});

	it("updateProfile - next on error", async () => {
		req.body = { name: "New" };
		prismaMock.user.update.mockRejectedValue(new Error("db"));
		await updateProfile(req as AuthRequest, res as Response, next);
		expect(next).toHaveBeenCalled();
	});

	it("changePassword - 400 missing", async () => {
		await changePassword(req as AuthRequest, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("changePassword - 400 too short", async () => {
		req.body = { currentPassword: "a", newPassword: "123" };
		await changePassword(req as AuthRequest, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("changePassword - 404 user not found", async () => {
		req.body = { currentPassword: "a", newPassword: "123456" };
		prismaMock.user.findUnique.mockResolvedValue(null);
		await changePassword(req as AuthRequest, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it("changePassword - 400 wrong current", async () => {
		req.body = { currentPassword: "a", newPassword: "123456" };
		prismaMock.user.findUnique.mockResolvedValue({ id: 1, password: "h" });
		bcryptMock.compare.mockResolvedValue(false);
		await changePassword(req as AuthRequest, res as Response, next);
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("changePassword - success", async () => {
		req.body = { currentPassword: "a", newPassword: "123456" };
		prismaMock.user.findUnique.mockResolvedValue({ id: 1, password: "h" });
		prismaMock.user.update.mockResolvedValue({});
		await changePassword(req as AuthRequest, res as Response, next);
		expect(res.json).toHaveBeenCalled();
	});

	it("changePassword - next on error", async () => {
		req.body = { currentPassword: "a", newPassword: "123456" };
		prismaMock.user.findUnique.mockResolvedValue({ id: 1, password: "h" });
		prismaMock.user.update.mockRejectedValue(new Error("db"));
		await changePassword(req as AuthRequest, res as Response, next);
		expect(next).toHaveBeenCalled();
	});

	it("getAllUsers - success", async () => {
		prismaMock.user.findMany.mockResolvedValue([{ id: 1 }]);
		await getAllUsers(req as AuthRequest, res as Response, next);
		expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
	});

	it("getAllUsers - next on error", async () => {
		prismaMock.user.findMany.mockRejectedValue(new Error("db"));
		await getAllUsers(req as AuthRequest, res as Response, next);
		expect(next).toHaveBeenCalled();
	});
});
