import { describe, it, expect, vi, beforeEach } from "vitest";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { setPrismaInstance, projectController } from "../../controllers/projectController";
import { PrismaClient } from "@prisma/client";

const mockPrisma = {
	project: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	},
	projectMember: {
		findMany: vi.fn(),
		create: vi.fn(),
		delete: vi.fn(),
		findUnique: vi.fn()
	},
	user: {
		findUnique: vi.fn()
	},
	$connect: vi.fn(),
	$disconnect: vi.fn()
};

describe("ProjectController", () => {
	let mockRequest: Partial<AuthRequest>;
	let mockResponse: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		vi.clearAllMocks();
		Object.values(mockPrisma.project).forEach(fn => fn.mockReset());
		Object.values(mockPrisma.projectMember).forEach(fn => fn.mockReset());
		Object.values(mockPrisma.user).forEach(fn => fn.mockReset());
		mockPrisma.$connect.mockReset();
		mockPrisma.$disconnect.mockReset();

		setPrismaInstance(mockPrisma as unknown as PrismaClient);

		mockRequest = {
			userId: 1,
			params: {},
			body: {}
		};

		mockResponse = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			send: vi.fn().mockReturnThis()
		};

		mockNext = vi.fn();
	});

	describe("getAllProjects", () => {
		it("should return all projects for user", async () => {
			const mockProjects = [
				{
					id: 1,
					title: "Project 1",
					description: "Description 1",
					ownerId: 1,
					members: []
				},
				{
					id: 2,
					title: "Project 2",
					description: "Description 2",
					ownerId: 1,
					members: []
				}
			];

			mockPrisma.project.findMany.mockResolvedValue(mockProjects);

			await projectController.getAllProjects(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
				where: { ownerId: 1 },
				orderBy: { createdAt: "desc" },
				include: {
					members: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true
								}
							}
						}
					}
				}
			});
			expect(mockResponse.json).toHaveBeenCalledWith(mockProjects);
		});

		it("should handle database errors", async () => {
			const error = new Error("Database error");
			mockPrisma.project.findMany.mockRejectedValue(error);

			await projectController.getAllProjects(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("getProjectById", () => {
		it("should return project when user is owner", async () => {
			const mockProject = {
				id: 1,
				title: "Test Project",
				description: "Test Description",
				ownerId: 1,
				members: []
			};

			mockRequest.params = { id: "1" };
			mockPrisma.project.findUnique.mockResolvedValue(mockProject);

			await projectController.getProjectById(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
				where: { id: 1 },
				include: {
					members: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true
								}
							}
						}
					}
				}
			});
			expect(mockResponse.json).toHaveBeenCalledWith(mockProject);
		});

		it("should return 404 when project not found", async () => {
			mockRequest.params = { id: "999" };
			mockPrisma.project.findUnique.mockResolvedValue(null);

			await projectController.getProjectById(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: "Projet non trouvé ou accès refusé."
			});
		});

		it("should return 404 when user is not owner", async () => {
			const mockProject = {
				id: 1,
				title: "Test Project",
				description: "Test Description",
				ownerId: 2, // Different owner
				members: []
			};

			mockRequest.params = { id: "1" };
			mockPrisma.project.findUnique.mockResolvedValue(mockProject);

			await projectController.getProjectById(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: "Projet non trouvé ou accès refusé."
			});
		});
	});

	describe("createProject", () => {
		it("should create project successfully", async () => {
			const projectData = {
				title: "New Project",
				description: "New Description",
				status: "En cours",
				priority: "Moyenne"
			};

			const mockCreatedProject = {
				id: 1,
				...projectData,
				ownerId: 1
			};

			mockRequest.body = projectData;
			mockPrisma.project.create.mockResolvedValue(mockCreatedProject);

			await projectController.createProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockPrisma.project.create).toHaveBeenCalledWith({
				data: {
					title: "New Project",
					description: "New Description",
					status: "En cours",
					priority: "Moyenne",
					owner: { connect: { id: 1 } }
				}
			});
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedProject);
		});

		it("should return 400 when title is missing", async () => {
			mockRequest.body = {
				description: "Description without title"
			};

			await projectController.createProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: "Le titre du projet est requis."
			});
		});

		it("should return 400 when status is invalid", async () => {
			mockRequest.body = {
				title: "Test Project",
				status: "Invalid Status"
			};

			await projectController.createProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: "Statut invalide. Valeurs autorisées : En attente, En cours, Terminé"
			});
		});

		it("should return 400 when priority is invalid", async () => {
			mockRequest.body = {
				title: "Test Project",
				priority: "Invalid Priority"
			};

			await projectController.createProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: "Priorité invalide. Valeurs autorisées : Basse, Moyenne, Haute"
			});
		});

		it("should call next on db error (createProject)", async () => {
			mockRequest.body = { title: "X" };
			mockPrisma.project.create.mockRejectedValue(new Error("db"));

			await projectController.createProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe("updateProject", () => {
		it("should update project successfully", async () => {
			const updateData = {
				title: "Updated Project",
				description: "Updated Description"
			};

			const mockProject = {
				id: 1,
				title: "Original Project",
				description: "Original Description",
				ownerId: 1,
				status: "En cours",
				priority: "Moyenne",
				createdAt: new Date(),
				updatedAt: new Date()
			};

			const mockUpdatedProject = {
				...mockProject,
				...updateData
			};

			mockRequest.params = { id: "1" };
			mockRequest.body = updateData;
			mockPrisma.project.findUnique.mockResolvedValue(mockProject);
			mockPrisma.project.update.mockResolvedValue(mockUpdatedProject);

			await projectController.updateProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockPrisma.project.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: {
					title: "Updated Project",
					description: "Updated Description",
					status: mockProject.status,
					priority: mockProject.priority
				}
			});
			expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedProject);
		});

		it("should return 404 when project not found", async () => {
			mockRequest.params = { id: "999" };
			mockRequest.body = { title: "Updated Project" };
			mockPrisma.project.findUnique.mockResolvedValue(null);

			await projectController.updateProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: "Projet non trouvé ou accès refusé."
			});
		});

		it("should call next on db error (updateProject)", async () => {
			mockRequest.params = { id: "1" };
			mockRequest.body = { title: "Updated" };
			mockPrisma.project.findUnique.mockResolvedValue({
				id: 1,
				ownerId: 1,
				title: "t",
				description: "d",
				status: "En attente",
				priority: "Basse"
			});
			mockPrisma.project.update.mockRejectedValue(new Error("db"));

			await projectController.updateProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe("deleteProject", () => {
		it("should delete project successfully", async () => {
			const mockProject = {
				id: 1,
				title: "Test Project",
				ownerId: 1
			};

			mockRequest.params = { id: "1" };
			mockPrisma.project.findUnique.mockResolvedValue(mockProject);
			mockPrisma.project.delete.mockResolvedValue(mockProject);

			await projectController.deleteProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockPrisma.project.delete).toHaveBeenCalledWith({
				where: { id: 1 }
			});
			expect(mockResponse.status).toHaveBeenCalledWith(204);
		});

		it("should return 404 when project not found", async () => {
			mockRequest.params = { id: "999" };
			mockPrisma.project.findUnique.mockResolvedValue(null);

			await projectController.deleteProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: "Projet non trouvé ou accès refusé."
			});
		});

		it("should call next on db error (deleteProject)", async () => {
			mockRequest.params = { id: "1" };
			mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 1 });
			mockPrisma.project.delete.mockRejectedValue(new Error("db"));

			await projectController.deleteProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe("updateProject validations", () => {
		it("should return 400 when update status is invalid", async () => {
			mockRequest.params = { id: "1" };
			mockRequest.body = { status: "Bad" };
			mockPrisma.project.findUnique.mockResolvedValue({
				id: 1,
				ownerId: 1,
				title: "t",
				description: "d",
				status: "En attente",
				priority: "Basse"
			});

			await projectController.updateProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: "Statut invalide. Valeurs autorisées : En attente, En cours, Terminé"
			});
		});

		it("should return 400 when update priority is invalid", async () => {
			mockRequest.params = { id: "1" };
			mockRequest.body = { priority: "Bad" };
			mockPrisma.project.findUnique.mockResolvedValue({
				id: 1,
				ownerId: 1,
				title: "t",
				description: "d",
				status: "En attente",
				priority: "Basse"
			});

			await projectController.updateProject(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: "Priorité invalide. Valeurs autorisées : Basse, Moyenne, Haute"
			});
		});
	});

	describe("getProjectMembers", () => {
		it("should return members for owner", async () => {
			mockRequest.params = { id: "1" };
			mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 1 });
			const members = [{ id: 1, userId: 2, projectId: 1, user: { id: 2, name: "A", email: "a@a.com" } }];
			mockPrisma.projectMember.findMany.mockResolvedValue(members);

			await projectController.getProjectMembers(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockPrisma.projectMember.findMany).toHaveBeenCalledWith({
				where: { projectId: 1 },
				include: {
					user: { select: { id: true, name: true, email: true } }
				},
				orderBy: { addedAt: "desc" }
			});
			expect(mockResponse.json).toHaveBeenCalledWith(members);
		});

		it("should return 404 when not owner", async () => {
			mockRequest.params = { id: "1" };
			mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 2 });

			await projectController.getProjectMembers(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: "Projet non trouvé ou accès refusé." });
		});

		it("should handle db error with next", async () => {
			mockRequest.params = { id: "1" };
			(mockPrisma as any).project.findUnique.mockRejectedValue(new Error("db"));
			await projectController.getProjectMembers(mockRequest as AuthRequest, mockResponse as Response, mockNext);
			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe("addProjectMember", () => {
		it("should return 400 when userId missing", async () => {
			mockRequest.params = { id: "1" };
			mockRequest.body = {};

			await projectController.addProjectMember(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: "L'ID de l'utilisateur est requis." });
		});

		it("should return 404 when project not found or not owner", async () => {
			mockRequest.params = { id: "1" };
			mockRequest.body = { userId: 2 };
			mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 2 });

			await projectController.addProjectMember(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: "Projet non trouvé ou accès refusé." });
		});

		it("should return 404 when user to add not found", async () => {
			mockRequest.params = { id: "1" };
			mockRequest.body = { userId: 3 };
			mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 1 });
			mockPrisma.user.findUnique.mockResolvedValue(null);

			await projectController.addProjectMember(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: "Utilisateur non trouvé." });
		});

		it("should return 409 when user already member", async () => {
			mockRequest.params = { id: "1" };
			mockRequest.body = { userId: 3 };
			mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 1 });
			mockPrisma.user.findUnique.mockResolvedValue({ id: 3, name: "N", email: "n@n.com" });
			mockPrisma.projectMember.findUnique.mockResolvedValue({ userId: 3, projectId: 1 });

			await projectController.addProjectMember(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(409);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: "L'utilisateur est déjà membre de ce projet." });
		});

		it("should add member successfully", async () => {
			mockRequest.params = { id: "1" };
			mockRequest.body = { userId: 4 };
			mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 1 });
			mockPrisma.user.findUnique.mockResolvedValue({ id: 4, name: "U", email: "u@u.com" });
			mockPrisma.projectMember.findUnique.mockResolvedValue(null);
			const newMember = { id: 10, userId: 4, projectId: 1, user: { id: 4, name: "U", email: "u@u.com" } };
			mockPrisma.projectMember.create.mockResolvedValue(newMember);

			await projectController.addProjectMember(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith(newMember);
		});

		it("should call next on db error (addProjectMember)", async () => {
			mockRequest.params = { id: "1" };
			mockRequest.body = { userId: 4 };
			mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 1 });
			mockPrisma.user.findUnique.mockResolvedValue({ id: 4 });
			mockPrisma.projectMember.findUnique.mockResolvedValue(null);
			mockPrisma.projectMember.create.mockRejectedValue(new Error("db"));

			await projectController.addProjectMember(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe("removeProjectMember", () => {
		it("should return 404 when not owner", async () => {
			mockRequest.params = { id: "1", userId: "2" };
			mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 2 });

			await projectController.removeProjectMember(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: "Projet non trouvé ou accès refusé." });
		});

		it("should return 404 when member not found", async () => {
			mockRequest.params = { id: "1", userId: "2" };
			mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 1 });
			mockPrisma.projectMember.findUnique.mockResolvedValue(null);

			await projectController.removeProjectMember(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: "Membre non trouvé dans ce projet." });
		});

		it("should remove member successfully", async () => {
			mockRequest.params = { id: "1", userId: "2" };
			mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 1 });
			mockPrisma.projectMember.findUnique.mockResolvedValue({ userId: 2, projectId: 1 });

			await projectController.removeProjectMember(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockPrisma.projectMember.delete).toHaveBeenCalledWith({
				where: { userId_projectId: { userId: 2, projectId: 1 } }
			});
			expect(mockResponse.status).toHaveBeenCalledWith(204);
		});

		it("should call next on db error (removeProjectMember)", async () => {
			mockRequest.params = { id: "1", userId: "2" };
			mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 1 });
			mockPrisma.projectMember.findUnique.mockResolvedValue({ userId: 2, projectId: 1 });
			mockPrisma.projectMember.delete.mockRejectedValue(new Error("db"));

			await projectController.removeProjectMember(mockRequest as AuthRequest, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
		});
	});
});
