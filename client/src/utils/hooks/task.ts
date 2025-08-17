import { useQuery } from "@tanstack/react-query";
import { taskService } from "../../services/task";
import { useProjects } from "./project";
import { TaskStatus, TaskPriority } from "../../types/enums";
import type { Task } from "../../services/task";

export interface TaskStatistics {
	totalTasks: number;
	completedTasks: number;
	pendingTasks: number;
	inProgressTasks: number;
	urgentTasks: number;
	overdueTasks: number;
	tasksThisMonth: number;
	completionRate: number;
}

export interface ProjectStatistics {
	totalProjects: number;
	activeProjects: number;
	completedProjects: number;
	pendingProjects: number;
}

export function useAllUserTasks() {
	const { data: projects } = useProjects();

	return useQuery<Task[], Error>({
		queryKey: ["all-user-tasks"],
		queryFn: async () => {
			if (!projects || projects.length === 0) {
				return [];
			}

			// Récupérer toutes les tâches de tous les projets de l'utilisateur
			const allTasksPromises = projects.map(project =>
				taskService.getProjectTasks(project.id)
			);

			const allTasksArrays = await Promise.all(allTasksPromises);

			// Aplatir le tableau de tableaux en un seul tableau
			return allTasksArrays.flat();
		},
		enabled: !!projects && projects.length > 0,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

export function useTaskStatistics(): TaskStatistics {
	const { data: tasks = [] } = useAllUserTasks();

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth();
	const currentYear = currentDate.getFullYear();

	const totalTasks = tasks.length;

	const completedTasks = tasks.filter(task =>
		task.status === TaskStatus.TERMINE
	).length;

	const pendingTasks = tasks.filter(task =>
		task.status === TaskStatus.A_FAIRE
	).length;

	const inProgressTasks = tasks.filter(task =>
		task.status === TaskStatus.EN_COURS
	).length;

	const urgentTasks = tasks.filter(task =>
		task.priority === TaskPriority.URGENTE
	).length;

	const overdueTasks = tasks.filter(task => {
		if (!task.dueDate) return false;
		const dueDate = new Date(task.dueDate);
		return dueDate < currentDate && task.status !== TaskStatus.TERMINE;
	}).length;

	const tasksThisMonth = tasks.filter(task => {
		const createdDate = new Date(task.createdAt);
		return createdDate.getMonth() === currentMonth &&
			createdDate.getFullYear() === currentYear;
	}).length;

	const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

	return {
		totalTasks,
		completedTasks,
		pendingTasks,
		inProgressTasks,
		urgentTasks,
		overdueTasks,
		tasksThisMonth,
		completionRate
	};
}

export function useProjectStatistics(): ProjectStatistics {
	const { data: projects = [] } = useProjects();

	const totalProjects = projects.length;

	const activeProjects = projects.filter(project =>
		project.status === 'En cours'
	).length;

	const completedProjects = projects.filter(project =>
		project.status === 'Terminé'
	).length;

	const pendingProjects = projects.filter(project =>
		project.status === 'En attente'
	).length;

	return {
		totalProjects,
		activeProjects,
		completedProjects,
		pendingProjects
	};
}
