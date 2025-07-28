// frontend/src/utils/hooks/projects.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchProjects,
	createProject,
	updateProject,
} from "../../services/project";
import type { Project, ProjectInput, ProjectMember } from "../../services/project";
export function useProjects() {
	return useQuery<Project[], Error>({
		queryKey: ["projects"],
		queryFn: fetchProjects,
	});
}
export function useCreateProject() {
	const queryClient = useQueryClient();
	return useMutation<Project, Error, ProjectInput>({
		mutationFn: createProject,
		onSuccess: () => {
			// Invalider la liste pour la rafraîchir
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}

// 4) Hook pour mettre à jour un projet
export function useUpdateProject() {
	const queryClient = useQueryClient();
	return useMutation<Project, Error, { id: number; data: ProjectInput }>({
		mutationFn: ({ id, data }) => updateProject(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}
