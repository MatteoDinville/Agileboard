import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../../services/project";
import type { Project, ProjectInput, ProjectMember } from "../../services/project";

export function useProjects() {
	return useQuery<Project[], Error>({
		queryKey: ["projects"],
		queryFn: () => projectService.fetchProjects(),
	});
}

export function useProject(projectId: number) {
	return useQuery<Project, Error>({
		queryKey: ["projects", projectId],
		queryFn: () => projectService.fetchProjectById(projectId),
		enabled: !!projectId,
	});
}
export function useCreateProject() {
	const queryClient = useQueryClient();
	return useMutation<Project, Error, ProjectInput>({
		mutationFn: projectService.createProject,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}

export function useUpdateProject() {
	const queryClient = useQueryClient();
	return useMutation<Project, Error, { id: number; data: ProjectInput }>({
		mutationFn: ({ id, data }) => projectService.updateProject(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}

export function useDeleteProject() {
	const queryClient = useQueryClient();
	return useMutation<void, Error, number>({
		mutationFn: projectService.deleteProject,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}

export function useProjectMembers(projectId: number) {
	return useQuery<ProjectMember[], Error>({
		queryKey: ["projects", projectId, "members"],
		queryFn: () => projectService.fetchProjectMembers(projectId),
		enabled: !!projectId,
	});
}

export function useAddProjectMember() {
	const queryClient = useQueryClient();
	return useMutation<ProjectMember, Error, { projectId: number; userId: number }>({
		mutationFn: ({ projectId, userId }) => projectService.addProjectMember(projectId, userId),
		onSuccess: (_, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: ["projects", projectId, "members"] });
			queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}

export function useRemoveProjectMember() {
	const queryClient = useQueryClient();
	return useMutation<void, Error, { projectId: number; userId: number }>({
		mutationFn: ({ projectId, userId }) => projectService.removeProjectMember(projectId, userId),
		onSuccess: (_, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: ["projects", projectId, "members"] });
			queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}
