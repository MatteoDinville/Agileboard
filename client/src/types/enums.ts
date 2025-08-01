export enum TaskStatus {
	A_FAIRE = "A_FAIRE",
	EN_COURS = "EN_COURS",
	TERMINE = "TERMINE"
}

export enum TaskPriority {
	BASSE = "BASSE",
	MOYENNE = "MOYENNE",
	HAUTE = "HAUTE",
	URGENTE = "URGENTE"
}

export type TaskStatusType = TaskStatus;
export type TaskPriorityType = TaskPriority;

export const TaskStatusLabels = {
	A_FAIRE: "À faire",
	EN_COURS: "En cours",
	TERMINE: "Terminé"
} as const;

export const TaskPriorityLabels = {
	BASSE: "Basse",
	MOYENNE: "Moyenne",
	HAUTE: "Haute",
	URGENTE: "Urgente"
} as const;