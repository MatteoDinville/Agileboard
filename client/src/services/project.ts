export type ProjectStatus = "En attente" | "En cours" | "Terminé";
export type ProjectPriority = "Basse" | "Moyenne" | "Haute";

export interface User {
	id: number;
	name?: string;
	email: string;
}

export interface ProjectMember {
	id: number;
	userId: number;
	projectId: number;
	addedAt: string;
	user: User;
}

export interface Project {
	id: number;
	title: string;
	description?: string;
	status?: ProjectStatus;
	priority?: ProjectPriority;
	createdAt: string;
	updatedAt: string;
	ownerId: number;
	owner?: User;
	members?: ProjectMember[];
	_count?: {
		members: number;
		tasks: number;
	};
}

export interface ProjectInput {
	title: string;
	description?: string;
	status?: ProjectStatus;
	priority?: ProjectPriority;
}

import { api } from "./api";
import { AxiosError } from "axios";

export const projectService = {
	/**
	 * GET /api/projects
	 */
	async fetchProjects(): Promise<Project[]> {
		try {
			const { data } = await api.get("/projects");
			return data;
		} catch (error: unknown) {
			throw new Error((error as AxiosError<{ error?: string }>).response?.data?.error || "Erreur lors de la récupération des projets");
		}
	},

	/**
	 * GET /api/projects/:id
	 */
	async fetchProjectById(id: number): Promise<Project> {
		try {
			const { data } = await api.get(`/projects/${id}`);
			return data;
		} catch (error: unknown) {
			throw new Error((error as AxiosError<{ error?: string }>).response?.data?.error || "Erreur : Projet introuvable ou accès refusé");
		}
	},

	/**
	 * POST /api/projects
	 */
	async createProject(data: ProjectInput): Promise<Project> {
		try {
			const { data: response } = await api.post("/projects", data);
			return response;
		} catch (error: unknown) {
			throw new Error((error as AxiosError<{ error?: string }>).response?.data?.error || "Erreur création projet");
		}
	},

	/**
	 * PUT /api/projects/:id
	 */
	async updateProject(
		id: number,
		data: ProjectInput
	): Promise<Project> {
		try {
			const { data: response } = await api.put(`/projects/${id}`, data);
			return response;
		} catch (error: unknown) {
			throw new Error((error as AxiosError<{ error?: string }>).response?.data?.error || "Erreur mise à jour projet");
		}
	},

	/**
	 * DELETE /api/projects/:id
	 */
	async deleteProject(id: number): Promise<void> {
		try {
			await api.delete(`/projects/${id}`);
		} catch (error: unknown) {
			throw new Error((error as AxiosError<{ error?: string }>).response?.data?.error || "Erreur suppression projet");
		}
	},

	/**
	 * GET /api/projects/:id/members
	 */
	async fetchProjectMembers(projectId: number): Promise<ProjectMember[]> {
		try {
			const { data } = await api.get(`/projects/${projectId}/members`);
			return data;
		} catch (error: unknown) {
			throw new Error((error as AxiosError<{ error?: string }>).response?.data?.error || "Erreur lors de la récupération des membres");
		}
	},

	/**
	 * POST /api/projects/:id/members
	 */
	async addProjectMember(projectId: number, userId: number): Promise<ProjectMember> {
		try {
			const { data } = await api.post(`/projects/${projectId}/members`, { userId });
			return data;
		} catch (error: unknown) {
			throw new Error((error as AxiosError<{ error?: string }>).response?.data?.error || "Erreur ajout membre");
		}
	},

	/**
	 * DELETE /api/projects/:id/members/:userId
	 */
	async removeProjectMember(projectId: number, userId: number): Promise<void> {
		try {
			await api.delete(`/projects/${projectId}/members/${userId}`);
		} catch (error: unknown) {
			throw new Error((error as AxiosError<{ error?: string }>).response?.data?.error || "Erreur suppression membre");
		}
	}
}
