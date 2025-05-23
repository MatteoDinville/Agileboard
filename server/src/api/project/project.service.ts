import { PrismaClient, Role } from '@prisma/client'
import createHttpError from 'http-errors'

const prisma = new PrismaClient()

/**
 * Tous les projets d’un utilisateur.
 */
export async function getAllProjects(userId: string) {
	return prisma.project.findMany({
		where: {
			members: { some: { userId } },          // <-- via ProjectMember
		},
		include: {
			members: {                              // <-- charge aussi les users
				include: { user: true },
			},
		},
	})
}

/**
 * Projet par id.
 */
export async function getProjectById(id: string) {
	const project = await prisma.project.findUnique({
		where: { id },
		include: {
			members: { include: { user: true } },
		},
	})
	if (!project) throw createHttpError(404, 'Project not found')
	return project
}

/**
 * Création d’un projet + inscription automatique du créateur comme PO.
 */
export async function createProject(
	userId: string,
	name: string,
	description?: string,
) {
	return prisma.project.create({
		data: {
			name,
			description,
			// clé projet « ABC » si tu en veux une ; sinon retire ce champ
			key: name
				.trim()
				.split(/\s+/)
				.map((w) => w[0])
				.join('')
				.toUpperCase()
				.slice(0, 5),

			members: {
				create: {
					userId,
					role: Role.PRODUCT_OWNER,
				},
			},
		},
		include: {
			members: { include: { user: true } },
		},
	})
}

/**
 * Mise à jour d’un projet (hors membres).
 */
export async function updateProject(
	id: string,
	name?: string,
	description?: string,
) {
	try {
		return await prisma.project.update({
			where: { id },
			data: { name, description },
			include: {
				members: { include: { user: true } },
			},
		})
	} catch {
		throw createHttpError(404, 'Project not found')
	}
}

/**
 * Suppression d’un projet.
 */
export async function deleteProject(id: string) {
	try {
		await prisma.project.delete({ where: { id } })
	} catch {
		throw createHttpError(404, 'Project not found')
	}
}

/**
 * Ajout ou retrait d’un membre.
 */
export async function addUserToProject(projectId: string, userId: string) {
	return prisma.projectMember.upsert({
		where: { userId_projectId: { userId, projectId } }, // clé composite
		update: {},                                         // déjà présent = no-op
		create: {
			userId,
			projectId,
			role: Role.DEVELOPER,
		},
	})
}

export async function removeUserFromProject(projectId: string, userId: string) {
	const deleted = await prisma.projectMember.deleteMany({
		where: { userId, projectId },
	})
	if (deleted.count === 0) throw createHttpError(404, 'Project not found')
}
