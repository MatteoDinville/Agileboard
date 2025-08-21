import { describe, it, expect, vi, beforeEach } from "vitest";
import { Response } from "express";
import { taskController } from "../../controllers/taskController";
import { AuthRequest } from "../../middleware/auth.middleware";

const prismaMock = vi.hoisted(() => ({
	project: { findFirst: vi.fn() },
	task: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), findFirst: vi.fn() }
}));
vi.mock("@prisma/client", () => ({ PrismaClient: vi.fn(() => prismaMock) }));

describe("taskController", () => {
	let req: Partial<AuthRequest>;
	let res: Partial<Response>;

	beforeEach(() => {
		vi.clearAllMocks();
		Object.values(prismaMock.project).forEach((fn) => (fn as any).mockReset());
		Object.values(prismaMock.task).forEach((fn) => (fn as any).mockReset());
		req = { params: {}, body: {}, userId: 1 };
		res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
	});

	it("getProjectTasks - 404 when no access", async () => {
		prismaMock.project.findFirst.mockResolvedValue(null);
		req.params = { projectId: "1" };
		await taskController.getProjectTasks(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it("getProjectTasks - success", async () => {
		prismaMock.project.findFirst.mockResolvedValue({ id: 1 });
		prismaMock.task.findMany.mockResolvedValue([]);
		req.params = { projectId: "1" };
		await taskController.getProjectTasks(req as AuthRequest, res as Response);
		expect(res.json).toHaveBeenCalledWith([]);
	});

	it("getProjectTasks - 500 on error", async () => {
		prismaMock.project.findFirst.mockRejectedValue(new Error("db"));
		req.params = { projectId: "1" };
		await taskController.getProjectTasks(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(500);
	});

	it("createTask - 404 when project not found", async () => {
		prismaMock.project.findFirst.mockResolvedValue(null);
		req.params = { projectId: "1" };
		await taskController.createTask(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it("createTask - 400 when assigned user not member", async () => {
		prismaMock.project.findFirst.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce(null);
		req.params = { projectId: "1" };
		req.body = { title: "t", assignedToId: 2 };
		await taskController.createTask(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("createTask - success", async () => {
		prismaMock.project.findFirst.mockResolvedValue({ id: 1 });
		prismaMock.task.create.mockResolvedValue({ id: 1 });
		req.params = { projectId: "1" };
		req.body = { title: "t" };
		await taskController.createTask(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(201);
	});

	it("createTask - 500 on error", async () => {
		prismaMock.project.findFirst.mockResolvedValue({ id: 1 });
		prismaMock.task.create.mockRejectedValue(new Error("db"));
		req.params = { projectId: "1" };
		req.body = { title: "t" };
		await taskController.createTask(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(500);
	});

	it("updateTask - 404 no access", async () => {
		prismaMock.task.findFirst.mockResolvedValue(null);
		req.params = { taskId: "1" };
		await taskController.updateTask(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it("updateTask - 400 assigned user not member", async () => {
		prismaMock.task.findFirst.mockResolvedValue({ id: 1, projectId: 1 });
		prismaMock.project.findFirst.mockResolvedValueOnce(null);
		req.params = { taskId: "1" };
		req.body = { assignedToId: 2 };
		await taskController.updateTask(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("updateTask - success", async () => {
		prismaMock.task.findFirst.mockResolvedValue({ id: 1, projectId: 1 });
		prismaMock.task.update.mockResolvedValue({ id: 1 });
		req.params = { taskId: "1" };
		req.body = { title: "n" };
		await taskController.updateTask(req as AuthRequest, res as Response);
		expect(res.json).toHaveBeenCalledWith({ id: 1 });
	});

	it("updateTask - 500 on error", async () => {
		prismaMock.task.findFirst.mockResolvedValue({ id: 1, projectId: 1 });
		prismaMock.task.update.mockRejectedValue(new Error("db"));
		req.params = { taskId: "1" };
		req.body = { title: "n" };
		await taskController.updateTask(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(500);
	});

	it("deleteTask - 404 no access", async () => {
		prismaMock.task.findFirst.mockResolvedValue(null);
		req.params = { taskId: "1" };
		await taskController.deleteTask(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it("deleteTask - success", async () => {
		prismaMock.task.findFirst.mockResolvedValue({ id: 1 });
		req.params = { taskId: "1" };
		await taskController.deleteTask(req as AuthRequest, res as Response);
		expect(res.json).toHaveBeenCalled();
	});

	it("deleteTask - 500 on error", async () => {
		prismaMock.task.findFirst.mockResolvedValue({ id: 1 });
		prismaMock.task.delete.mockRejectedValue(new Error("db"));
		req.params = { taskId: "1" };
		await taskController.deleteTask(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(500);
	});

	it("updateTaskStatus - 404 no access", async () => {
		prismaMock.task.findFirst.mockResolvedValue(null);
		req.params = { taskId: "1" };
		await taskController.updateTaskStatus(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it("updateTaskStatus - success", async () => {
		prismaMock.task.findFirst.mockResolvedValue({ id: 1 });
		prismaMock.task.update.mockResolvedValue({ id: 1 });
		req.params = { taskId: "1" };
		req.body = { status: "En cours" };
		await taskController.updateTaskStatus(req as AuthRequest, res as Response);
		expect(res.json).toHaveBeenCalledWith({ id: 1 });
	});

	it("updateTaskStatus - 500 on error", async () => {
		prismaMock.task.findFirst.mockResolvedValue({ id: 1 });
		prismaMock.task.update.mockRejectedValue(new Error("db"));
		req.params = { taskId: "1" };
		req.body = { status: "En cours" };
		await taskController.updateTaskStatus(req as AuthRequest, res as Response);
		expect(res.status).toHaveBeenCalledWith(500);
	});
});
