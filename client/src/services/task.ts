const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export interface Task {
	id: number;
	title: string;
	description?: string;
	status: string;
	priority: string;
	dueDate?: string;
	createdAt: string;
	updatedAt: string;
	projectId: number;
	assignedToId?: number;
	assignedTo?: {
		id: number;
		name?: string;
		email: string;
	};
}

export interface CreateTaskData {
	title: string;
	description?: string;
	status?: string;
	priority?: string;
	dueDate?: string;
	assignedToId?: number;
}

export interface UpdateTaskData {
	title?: string;
	description?: string;
	status?: string;
	priority?: string;
	dueDate?: string;
	assignedToId?: number;
}

export const taskService = {
	// Récupérer toutes les tâches d'un projet
	async getProjectTasks(projectId: number): Promise<Task[]> {
		const res = await fetch(`${API_URL}/tasks/project/${projectId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error ?? "Erreur lors de la récupération des tâches");
		}

		return res.json();
	},

	// Créer une nouvelle tâche
	async createTask(projectId: number, data: CreateTaskData): Promise<Task> {
		const res = await fetch(`${API_URL}/tasks/project/${projectId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(data),
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error ?? "Erreur lors de la création de la tâche");
		}

		return res.json();
	},

	// Mettre à jour une tâche
	async updateTask(taskId: number, data: UpdateTaskData): Promise<Task> {
		const res = await fetch(`${API_URL}/tasks/${taskId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(data),
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error ?? "Erreur lors de la mise à jour de la tâche");
		}

		return res.json();
	},

	// Supprimer une tâche
	async deleteTask(taskId: number): Promise<void> {
		const res = await fetch(`${API_URL}/tasks/${taskId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error ?? "Erreur lors de la suppression de la tâche");
		}
	},

	// Mettre à jour le statut d'une tâche (pour le drag & drop)
	async updateTaskStatus(taskId: number, status: string): Promise<Task> {
		const res = await fetch(`${API_URL}/tasks/${taskId}/status`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ status }),
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error ?? "Erreur lors de la mise à jour du statut");
		}

		return res.json();
	},
}