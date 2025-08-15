import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

let prisma: PrismaClient = new PrismaClient();
export function setPrismaInstance(instance: PrismaClient) {
	prisma = instance;
}

export const projectController = {
	/**
	 * GET /api/projects
	 * Récupère tous les projets de l'utilisateur connecté (owner ou membre)
	 */
	getAllProjects: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			// req.userId provient du middleware authenticateToken
			const userId = req.userId!;

			const projects = await prisma.project.findMany({
				where: {
					OR: [
						// Projets dont l'utilisateur est propriétaire
						{ ownerId: userId },
						// Projets dont l'utilisateur est membre
						{
							members: {
								some: {
									userId: userId
								}
							}
						}
					]
				},
				orderBy: { createdAt: "desc" },
				include: {
					owner: {
						select: {
							id: true,
							name: true,
							email: true,
						}
					},
					members: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
								}
							}
						}
					},
					_count: {
						select: {
							members: true,
							tasks: true
						}
					}
				}
			});

			res.json(projects);
		} catch (err) {
			next(err);
		}
	},

	/**
	 * GET /api/projects/:id
	 * Récupère un seul projet, si l'utilisateur en est propriétaire ou membre
	 */
	getProjectById: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const userId = req.userId!;
			const projectId = parseInt(req.params.id, 10);

			const project = await prisma.project.findUnique({
				where: { id: projectId },
				include: {
					owner: {
						select: {
							id: true,
							name: true,
							email: true,
						}
					},
					members: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
								}
							}
						}
					},
					_count: {
						select: {
							members: true,
							tasks: true
						}
					}
				}
			});

			if (!project) {
				return res.status(404).json({ error: "Projet non trouvé." });
			}

			// Vérifier si l'utilisateur est owner ou membre
			const isOwner = project.ownerId === userId;
			const isMember = project.members.some(member => member.userId === userId);

			if (!isOwner && !isMember) {
				return res.status(403).json({ error: "Accès refusé. Vous n'êtes ni propriétaire ni membre de ce projet." });
			}

			res.json(project);
		} catch (err) {
			next(err);
		}
	},

	/**
	 * POST /api/projects
	 * Crée un nouveau projet pour l'utilisateur connecté
	 * Corps attendu : { title: string, description?: string, status?: string, priority?: string }
	 */
	createProject: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const userId = req.userId!;
			const { title, description, status, priority } = req.body;

			if (!title) {
				return res.status(400).json({ error: "Le titre du projet est requis." });
			}

			const validStatuses = ["En attente", "En cours", "Terminé"];
			const validPriorities = ["Basse", "Moyenne", "Haute"];

			if (status && !validStatuses.includes(status)) {
				return res.status(400).json({
					error: `Statut invalide. Valeurs autorisées : ${validStatuses.join(", ")}`
				});
			}

			if (priority && !validPriorities.includes(priority)) {
				return res.status(400).json({
					error: `Priorité invalide. Valeurs autorisées : ${validPriorities.join(", ")}`
				});
			}

			const newProject = await prisma.project.create({
				data: {
					title,
					description: description ?? null,
					status: status ?? "En attente",
					priority: priority ?? "Basse",
					owner: { connect: { id: userId } },
				},
			});

			res.status(201).json(newProject);
		} catch (err) {
			next(err);
		}
	},

	/**
	 * PUT /api/projects/:id
	 * Met à jour un projet existant, si l'utilisateur en est propriétaire
	 * Corps attendu : { title?: string, description?: string, status?: string, priority?: string }
	 */
	updateProject: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const userId = req.userId!;
			const projectId = parseInt(req.params.id, 10);
			const { title, description, status, priority } = req.body;

			const existing = await prisma.project.findUnique({ where: { id: projectId } });
			if (!existing || existing.ownerId !== userId) {
				return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
			}

			const validStatuses = ["En attente", "En cours", "Terminé"];
			const validPriorities = ["Basse", "Moyenne", "Haute"];

			if (status && !validStatuses.includes(status)) {
				return res.status(400).json({
					error: `Statut invalide. Valeurs autorisées : ${validStatuses.join(", ")}`
				});
			}

			if (priority && !validPriorities.includes(priority)) {
				return res.status(400).json({
					error: `Priorité invalide. Valeurs autorisées : ${validPriorities.join(", ")}`
				});
			}

			const updated = await prisma.project.update({
				where: { id: projectId },
				data: {
					title: title ?? existing.title,
					description: description ?? existing.description,
					status: status ?? existing.status,
					priority: priority ?? existing.priority,
				},
			});

			res.json(updated);
		} catch (err) {
			next(err);
		}
	},

	/**
	 * DELETE /api/projects/:id
	 * Supprime un projet, si l'utilisateur en est propriétaire
	 */
	deleteProject: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const userId = req.userId!;
			const projectId = parseInt(req.params.id, 10);

			const existing = await prisma.project.findUnique({ where: { id: projectId } });
			if (!existing || existing.ownerId !== userId) {
				return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
			}

			await prisma.project.delete({ where: { id: projectId } });
			res.status(204).send();
		} catch (err) {
			next(err);
		}
	},

	/**
	 * GET /api/projects/:id/members
	 * Récupère la liste des membres d'un projet
	 */
	getProjectMembers: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const userId = req.userId!;
			const projectId = parseInt(req.params.id, 10);

			const project = await prisma.project.findUnique({
				where: { id: projectId }
			});

			if (!project || project.ownerId !== userId) {
				return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
			}

			const members = await prisma.projectMember.findMany({
				where: { projectId },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						}
					}
				},
				orderBy: { addedAt: "desc" }
			});

			res.json(members);
		} catch (err) {
			next(err);
		}
	},

	/**
	 * POST /api/projects/:id/members
	 * Ajoute un membre à un projet
	 * Corps attendu : { userId: number }
	 */
	addProjectMember: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const currentUserId = req.userId!;
			const projectId = parseInt(req.params.id, 10);
			const { userId } = req.body;

			if (!userId) {
				return res.status(400).json({ error: "L'ID de l'utilisateur est requis." });
			}

			const project = await prisma.project.findUnique({
				where: { id: projectId }
			});

			if (!project || project.ownerId !== currentUserId) {
				return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
			}

			const userToAdd = await prisma.user.findUnique({
				where: { id: userId },
				select: { id: true, name: true, email: true }
			});

			if (!userToAdd) {
				return res.status(404).json({ error: "Utilisateur non trouvé." });
			}

			const existingMember = await prisma.projectMember.findUnique({
				where: {
					userId_projectId: {
						userId,
						projectId
					}
				}
			});

			if (existingMember) {
				return res.status(409).json({ error: "L'utilisateur est déjà membre de ce projet." });
			}

			const newMember = await prisma.projectMember.create({
				data: {
					userId,
					projectId
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						}
					}
				}
			});

			res.status(201).json(newMember);
		} catch (err) {
			next(err);
		}
	},

	/**
	 * DELETE /api/projects/:id/members/:userId
	 * Supprime un membre d'un projet
	 */
	removeProjectMember: async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const currentUserId = req.userId!;
			const projectId = parseInt(req.params.id, 10);
			const memberUserId = parseInt(req.params.userId, 10);

			const project = await prisma.project.findUnique({
				where: { id: projectId }
			});

			if (!project || project.ownerId !== currentUserId) {
				return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
			}

			const existingMember = await prisma.projectMember.findUnique({
				where: {
					userId_projectId: {
						userId: memberUserId,
						projectId
					}
				}
			});

			if (!existingMember) {
				return res.status(404).json({ error: "Membre non trouvé dans ce projet." });
			}

			await prisma.projectMember.delete({
				where: {
					userId_projectId: {
						userId: memberUserId,
						projectId
					}
				}
			});

			res.status(204).send();
		} catch (err) {
			next(err);
		}
	}
}
