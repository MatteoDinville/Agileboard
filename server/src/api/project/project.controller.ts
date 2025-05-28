import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import * as projectService from './project.service'
import { Role } from '@prisma/client'

export const allProjects = async (req: Request, res: Response) => {
	if (!req.user) throw createHttpError(401, 'Non authentifié')
	const userId = req.user.id

	const projects = await projectService.getAllProjects(userId)
	res.json(projects)
}

export const projectById = async (req: Request, res: Response) => {
	const { id } = req.params
	const project = await projectService.getProjectById(id)
	res.json(project)
}

export const createProject = async (req: Request, res: Response) => {
	const { userId, name, description } = req.body
	if (!userId || !name) {
		throw createHttpError(400, 'User ID and name are required')
	}

	const project = await projectService.createProject(userId, name, description)
	res.status(201).json(project)
}

export const updateProject = async (req: Request, res: Response) => {
	const { id } = req.params
	const { name, description } = req.body
	const project = await projectService.updateProject(id, name, description)
	res.json(project)
}

export const deleteProject = async (req: Request, res: Response) => {
	const { id } = req.params
	await projectService.deleteProject(id)
	res.json({ message: 'Project deleted successfully' })
}

export const addUserToProject = async (req: Request, res: Response) => {
	const { projectId, userId } = req.body
	if (!projectId || !userId) {
		throw createHttpError(400, 'Project ID and User ID are required')
	}
	await projectService.addUserToProject(projectId, userId)
	res.json({ message: 'User added to project' })
}

export const removeUserFromProject = async (req: Request, res: Response) => {
	const { projectId, userId } = req.body
	if (!projectId || !userId) {
		throw createHttpError(400, 'Project ID and User ID are required')
	}
	await projectService.removeUserFromProject(projectId, userId)
	res.json({ message: 'User removed from project' })
}

export const updateMemberRole = async (req: Request, res: Response) => {
	const { projectId, memberId } = req.params;
	const { role } = req.body;

	if (!role || !Object.values(Role).includes(role)) {
		throw createHttpError(400, 'Invalid role');
	}

	await projectService.updateMemberRole(projectId, memberId, role);
	res.json({ message: 'Member role updated successfully' });
};
