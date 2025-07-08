import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

/**
 * GET /api/projects
 * Récupère tous les projets de l'utilisateur connecté
 */
export const getAllProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		// req.userId provient du middleware authenticateToken
		const userId = req.userId!;
		const projects = await prisma.project.findMany({
			where: { ownerId: userId },
			orderBy: { createdAt: "desc" },
			include: {
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
				}
			}
		});
		res.json(projects);
	} catch (err) {
		next(err);
	}
};

/**
 * GET /api/projects/:id
 * Récupère un seul projet, si l'utilisateur en est propriétaire
 */
export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.userId!;
		const projectId = parseInt(req.params.id, 10);

		const project = await prisma.project.findUnique({
			where: { id: projectId },
			include: {
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
				}
			}
		});

		if (!project || project.ownerId !== userId) {
			return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
		}

		res.json(project);
	} catch (err) {
		next(err);
	}
};

/**
 * POST /api/projects
 * Crée un nouveau projet pour l'utilisateur connecté
 * Corps attendu : { title: string, description?: string, status?: string, priority?: string }
 */
export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.userId!;
		const { title, description, status, priority } = req.body;

		if (!title) {
			return res.status(400).json({ error: "Le titre du projet est requis." });
		}

		// Validation des valeurs de status et priority
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
};

/**
 * PUT /api/projects/:id
 * Met à jour un projet existant, si l'utilisateur en est propriétaire
 * Corps attendu : { title?: string, description?: string, status?: string, priority?: string }
 */
export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.userId!;
		const projectId = parseInt(req.params.id, 10);
		const { title, description, status, priority } = req.body;

		// 1) On vérifie d'abord que le projet existe et appartient à l'utilisateur
		const existing = await prisma.project.findUnique({ where: { id: projectId } });
		if (!existing || existing.ownerId !== userId) {
			return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
		}

		// Validation des valeurs de status et priority si fournies
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

		// 2) On effectue la mise à jour
		const updated = await prisma.project.update({
			where: { id: projectId },
			data: {
				title: title ?? existing.title,
				description: description ?? existing.description,
				status: status ?? existing.status,
				priority: priority ?? existing.priority,
				// updatedAt sera mis à jour automatiquement
			},
		});

		res.json(updated);
	} catch (err) {
		next(err);
	}
};

/**
 * DELETE /api/projects/:id
 * Supprime un projet, si l'utilisateur en est propriétaire
 */
export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.userId!;
		const projectId = parseInt(req.params.id, 10);

		const existing = await prisma.project.findUnique({ where: { id: projectId } });
		if (!existing || existing.ownerId !== userId) {
			return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
		}

		await prisma.project.delete({ where: { id: projectId } });
		res.status(204).send(); // No Content
	} catch (err) {
		next(err);
	}
};

/**
 * GET /api/projects/:id/members
 * Récupère la liste des membres d'un projet
 */
export const getProjectMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const userId = req.userId!;
		const projectId = parseInt(req.params.id, 10);

		// Vérifier que l'utilisateur est propriétaire du projet
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
};

/**
 * POST /api/projects/:id/members
 * Ajoute un membre à un projet
 * Corps attendu : { userId: number }
 */
export const addProjectMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const currentUserId = req.userId!;
		const projectId = parseInt(req.params.id, 10);
		const { userId } = req.body;

		if (!userId) {
			return res.status(400).json({ error: "L'ID de l'utilisateur est requis." });
		}

		// Vérifier que l'utilisateur connecté est propriétaire du projet
		const project = await prisma.project.findUnique({
			where: { id: projectId }
		});

		if (!project || project.ownerId !== currentUserId) {
			return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
		}

		// Vérifier que l'utilisateur à ajouter existe
		const userToAdd = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, name: true, email: true }
		});

		if (!userToAdd) {
			return res.status(404).json({ error: "Utilisateur non trouvé." });
		}

		// Vérifier que l'utilisateur n'est pas déjà membre
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

		// Ajouter le membre
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
};

/**
 * DELETE /api/projects/:id/members/:userId
 * Supprime un membre d'un projet
 */
export const removeProjectMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const currentUserId = req.userId!;
		const projectId = parseInt(req.params.id, 10);
		const memberUserId = parseInt(req.params.userId, 10);

		// Vérifier que l'utilisateur connecté est propriétaire du projet
		const project = await prisma.project.findUnique({
			where: { id: projectId }
		});

		if (!project || project.ownerId !== currentUserId) {
			return res.status(404).json({ error: "Projet non trouvé ou accès refusé." });
		}

		// Vérifier que le membre existe
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

		// Supprimer le membre
		await prisma.projectMember.delete({
			where: {
				userId_projectId: {
					userId: memberUserId,
					projectId
				}
			}
		});

		res.status(204).send(); // No Content
	} catch (err) {
		next(err);
	}
};
