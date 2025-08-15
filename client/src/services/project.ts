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

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const projectService = {
	/**
	 * GET /api/projects
	 */
	async fetchProjects(): Promise<Project[]> {
		const res = await fetch(`${API_URL}/projects`, {
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error("Erreur lors de la récupération des projets");
		}
		return res.json();
	},

	/**
	 * GET /api/projects/:id
	 */
	async fetchProjectById(id: number): Promise<Project> {
		const res = await fetch(`${API_URL}/projects/${id}`, {
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error("Erreur : Projet introuvable ou accès refusé");
		}
		return res.json();
	},

	/**
	 * POST /api/projects
	 */
	async createProject(data: ProjectInput): Promise<Project> {
		const res = await fetch(`${API_URL}/projects`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Erreur création projet");
		}
		return res.json();
	},

	/**
	 * PUT /api/projects/:id
	 */
	async updateProject(
		id: number,
		data: ProjectInput
	): Promise<Project> {
		const res = await fetch(`${API_URL}/projects/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Erreur mise à jour projet");
		}
		return res.json();
	},

	/**
	 * DELETE /api/projects/:id
	 */
	async deleteProject(id: number): Promise<void> {
		const res = await fetch(`${API_URL}/projects/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});
		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Erreur suppression projet");
		}
	},

	/**
	 * GET /api/projects/:id/members
	 */
	async fetchProjectMembers(projectId: number): Promise<ProjectMember[]> {
		const res = await fetch(`${API_URL}/projects/${projectId}/members`, {
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error("Erreur lors de la récupération des membres");
		}
		return res.json();
	},

	/**
	 * POST /api/projects/:id/members
	 */
	async addProjectMember(projectId: number, userId: number): Promise<ProjectMember> {
		const res = await fetch(`${API_URL}/projects/${projectId}/members`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ userId }),
		});
		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Erreur ajout membre");
		}
		return res.json();
	},

	/**
	 * DELETE /api/projects/:id/members/:userId
	 */
	async removeProjectMember(projectId: number, userId: number): Promise<void> {
		const res = await fetch(`${API_URL}/projects/${projectId}/members/${userId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});
		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || "Erreur suppression membre");
		}
	}
}
