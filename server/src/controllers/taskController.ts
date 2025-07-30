import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: number;
				email: string;
				name: string;
			};
		}
	}
}

const prisma = new PrismaClient();

export const taskController = {
	async getProjectTasks(req: Request, res: Response) {
		try {
			const { projectId } = req.params;
			const userId = req.user?.id;

			const project = await prisma.project.findFirst({
				where: {
					id: parseInt(projectId),
					OR: [
						{ ownerId: userId },
						{ members: { some: { userId: userId } } }
					]
				}
			});

			if (!project) {
				return res.status(404).json({ error: "Projet non trouvé ou accès refusé" });
			}

			const tasks = await prisma.task.findMany({
				where: { projectId: parseInt(projectId) },
				include: {
					assignedTo: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				},
				orderBy: [
					{ status: 'asc' },
					{ createdAt: 'desc' }
				]
			});

			res.json(tasks);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Erreur lors de la récupération des tâches" });
		}
	},

	async createTask(req: Request, res: Response) {
		try {
			const { projectId } = req.params;
			const { title, description, priority, dueDate, assignedToId } = req.body;
			const userId = req.user?.id;

			const project = await prisma.project.findFirst({
				where: {
					id: parseInt(projectId),
					OR: [
						{ ownerId: userId },
						{ members: { some: { userId: userId } } }
					]
				}
			});

			if (!project) {
				return res.status(404).json({ error: "Projet non trouvé ou accès refusé" });
			}

			if (assignedToId) {
				const isMember = await prisma.project.findFirst({
					where: {
						id: parseInt(projectId),
						OR: [
							{ ownerId: assignedToId },
							{ members: { some: { userId: assignedToId } } }
						]
					}
				});

				if (!isMember) {
					return res.status(400).json({ error: "L'utilisateur assigné doit être membre du projet" });
				}
			}

			const task = await prisma.task.create({
				data: {
					title,
					description,
					priority: priority || "Moyenne",
					dueDate: dueDate ? new Date(dueDate) : null,
					projectId: parseInt(projectId),
					assignedToId: assignedToId || null
				},
				include: {
					assignedTo: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				}
			});

			res.status(201).json(task);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Erreur lors de la création de la tâche" });
		}
	},

	async updateTask(req: Request, res: Response) {
		try {
			const { taskId } = req.params;
			const { title, description, status, priority, dueDate, assignedToId } = req.body;
			const userId = req.user?.id;

			const existingTask = await prisma.task.findFirst({
				where: {
					id: parseInt(taskId),
					project: {
						OR: [
							{ ownerId: userId },
							{ members: { some: { userId: userId } } }
						]
					}
				},
				include: { project: true }
			});

			if (!existingTask) {
				return res.status(404).json({ error: "Tâche non trouvée ou accès refusé" });
			}

			if (assignedToId) {
				const isMember = await prisma.project.findFirst({
					where: {
						id: existingTask.projectId,
						OR: [
							{ ownerId: assignedToId },
							{ members: { some: { userId: assignedToId } } }
						]
					}
				});

				if (!isMember) {
					return res.status(400).json({ error: "L'utilisateur assigné doit être membre du projet" });
				}
			}

			const updateData: any = {};
			if (title !== undefined) updateData.title = title;
			if (description !== undefined) updateData.description = description;
			if (status !== undefined) updateData.status = status;
			if (priority !== undefined) updateData.priority = priority;
			if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
			if (assignedToId !== undefined) updateData.assignedToId = assignedToId;

			const task = await prisma.task.update({
				where: { id: parseInt(taskId) },
				data: updateData,
				include: {
					assignedTo: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				}
			});

			res.json(task);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Erreur lors de la mise à jour de la tâche" });
		}
	},

	async deleteTask(req: Request, res: Response) {
		try {
			const { taskId } = req.params;
			const userId = req.user?.id;

			const existingTask = await prisma.task.findFirst({
				where: {
					id: parseInt(taskId),
					project: {
						OR: [
							{ ownerId: userId },
							{ members: { some: { userId: userId } } }
						]
					}
				}
			});

			if (!existingTask) {
				return res.status(404).json({ error: "Tâche non trouvée ou accès refusé" });
			}

			await prisma.task.delete({
				where: { id: parseInt(taskId) }
			});

			res.json({ message: "Tâche supprimée avec succès" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Erreur lors de la suppression de la tâche" });
		}
	},

	async updateTaskStatus(req: Request, res: Response) {
		try {
			const { taskId } = req.params;
			const { status } = req.body;
			const userId = req.user?.id;

			const existingTask = await prisma.task.findFirst({
				where: {
					id: parseInt(taskId),
					project: {
						OR: [
							{ ownerId: userId },
							{ members: { some: { userId: userId } } }
						]
					}
				}
			});

			if (!existingTask) {
				return res.status(404).json({ error: "Tâche non trouvée ou accès refusé" });
			}

			const task = await prisma.task.update({
				where: { id: parseInt(taskId) },
				data: { status },
				include: {
					assignedTo: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				}
			});

			res.json(task);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
		}
	}
};
