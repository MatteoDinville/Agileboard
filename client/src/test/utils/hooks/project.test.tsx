import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

vi.mock('@tanstack/react-query', async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...actual,
	}
})
import { useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject, useProjectMembers, useAddProjectMember, useRemoveProjectMember } from '../../../utils/hooks/project'
import { projectService } from '../../../services/project'
import type { Project, ProjectInput, ProjectMember } from '../../../services/project'

vi.mock('../../../services/project', () => ({
	projectService: {
		fetchProjects: vi.fn(),
		fetchProjectById: vi.fn(),
		createProject: vi.fn(),
		updateProject: vi.fn(),
		deleteProject: vi.fn(),
		fetchProjectMembers: vi.fn(),
		addProjectMember: vi.fn(),
		removeProjectMember: vi.fn(),
	}
}))

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	})

	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient} >
			{children}
		</QueryClientProvider>
	)
}

describe('Project Hooks', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('useProjects', () => {
		it('should fetch projects successfully', async () => {
			const mockProjects: Project[] = [
				{
					id: 1,
					name: 'Project 1',
					description: 'Description 1',
					keyCode: 'PROJ1',
					status: 'ACTIVE',
					priority: 'HIGH',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					ownerId: 1,
					owner: {
						id: 1,
						name: 'John Doe',
						email: 'john@example.com'
					}
				}
			]

			vi.mocked(projectService.fetchProjects).mockResolvedValue(mockProjects)

			const { result } = renderHook(() => useProjects(), {
				wrapper: createWrapper()
			})

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true)
			})

			expect(result.current.data).toEqual(mockProjects)
			expect(projectService.fetchProjects).toHaveBeenCalled()
		})

		it('should handle error when fetching projects fails', async () => {
			const error = new Error('Failed to fetch projects')
			vi.mocked(projectService.fetchProjects).mockRejectedValue(error)

			const { result } = renderHook(() => useProjects(), {
				wrapper: createWrapper()
			})

			await waitFor(() => {
				expect(result.current.isError).toBe(true)
			})

			expect(result.current.error).toEqual(error)
		})
	})

	describe('useProject', () => {
		it('should fetch single project successfully', async () => {
			const mockProject: Project = {
				id: 1,
				name: 'Project 1',
				description: 'Description 1',
				keyCode: 'PROJ1',
				status: 'ACTIVE',
				priority: 'HIGH',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				ownerId: 1,
				owner: {
					id: 1,
					name: 'John Doe',
					email: 'john@example.com'
				}
			}

			vi.mocked(projectService.fetchProjectById).mockResolvedValue(mockProject)

			const { result } = renderHook(() => useProject(1), {
				wrapper: createWrapper()
			})

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true)
			})

			expect(result.current.data).toEqual(mockProject)
			expect(projectService.fetchProjectById).toHaveBeenCalledWith(1)
		})

		it('should not fetch when projectId is falsy', () => {
			const { result } = renderHook(() => useProject(0), {
				wrapper: createWrapper()
			})

			expect(result.current.isFetching).toBe(false)
			expect(projectService.fetchProjectById).not.toHaveBeenCalled()
		})
	})

	describe('useCreateProject', () => {
		it('should create project successfully', async () => {
			const mockProject: Project = {
				id: 1,
				name: 'New Project',
				description: 'New Description',
				keyCode: 'NEW',
				status: 'ACTIVE',
				priority: 'HIGH',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				ownerId: 1,
				owner: {
					id: 1,
					name: 'John Doe',
					email: 'john@example.com'
				}
			}

			const projectInput: ProjectInput = {
				name: 'New Project',
				description: 'New Description',
				keyCode: 'NEW',
				status: 'ACTIVE',
				priority: 'HIGH'
			}

			vi.mocked(projectService.createProject).mockResolvedValue(mockProject)

			const { result } = renderHook(() => useCreateProject(), {
				wrapper: createWrapper()
			})

			result.current.mutate(projectInput)

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true)
			})

			expect(result.current.data).toEqual(mockProject)
			expect(projectService.createProject).toHaveBeenCalledWith(projectInput)
		})
	})

	describe('useUpdateProject', () => {
		it('should update project successfully', async () => {
			const mockProject: Project = {
				id: 1,
				name: 'Updated Project',
				description: 'Updated Description',
				keyCode: 'UPD',
				status: 'ACTIVE',
				priority: 'HIGH',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				ownerId: 1,
				owner: {
					id: 1,
					name: 'John Doe',
					email: 'john@example.com'
				}
			}

			const projectInput: ProjectInput = {
				name: 'Updated Project',
				description: 'Updated Description'
			}

			vi.mocked(projectService.updateProject).mockResolvedValue(mockProject)

			const { result } = renderHook(() => useUpdateProject(), {
				wrapper: createWrapper()
			})

			result.current.mutate({ id: 1, data: projectInput })

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true)
			})

			expect(result.current.data).toEqual(mockProject)
			expect(projectService.updateProject).toHaveBeenCalledWith(1, projectInput)
		})
	})

	describe('useDeleteProject', () => {
		it('should delete project successfully', async () => {
			vi.mocked(projectService.deleteProject).mockResolvedValue()

			const { result } = renderHook(() => useDeleteProject(), {
				wrapper: createWrapper()
			})

			result.current.mutate(1)

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true)
			})

			expect(projectService.deleteProject).toHaveBeenCalledWith(1)
		})
	})

	describe('useProjectMembers', () => {
		it('should fetch project members successfully', async () => {
			const mockMembers: ProjectMember[] = [
				{
					id: 1,
					projectId: 1,
					userId: 1,
					role: 'MEMBER',
					joinedAt: '2024-01-01T00:00:00Z',
					user: {
						id: 1,
						name: 'John Doe',
						email: 'john@example.com'
					}
				}
			]

			vi.mocked(projectService.fetchProjectMembers).mockResolvedValue(mockMembers)

			const { result } = renderHook(() => useProjectMembers(1), {
				wrapper: createWrapper()
			})

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true)
			})

			expect(result.current.data).toEqual(mockMembers)
			expect(projectService.fetchProjectMembers).toHaveBeenCalledWith(1)
		})

		it('should not fetch when projectId is falsy', () => {
			const { result } = renderHook(() => useProjectMembers(0), {
				wrapper: createWrapper()
			})

			expect(result.current.isFetching).toBe(false)
			expect(projectService.fetchProjectMembers).not.toHaveBeenCalled()
		})
	})

	describe('useAddProjectMember', () => {
		it('should add project member successfully', async () => {
			const mockMember: ProjectMember = {
				id: 1,
				projectId: 1,
				userId: 2,
				role: 'MEMBER',
				joinedAt: '2024-01-01T00:00:00Z',
				user: {
					id: 2,
					name: 'Jane Smith',
					email: 'jane@example.com'
				}
			}

			vi.mocked(projectService.addProjectMember).mockResolvedValue(mockMember)

			const { result } = renderHook(() => useAddProjectMember(), {
				wrapper: createWrapper()
			})

			result.current.mutate({ projectId: 1, userId: 2 })

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true)
			})

			expect(result.current.data).toEqual(mockMember)
			expect(projectService.addProjectMember).toHaveBeenCalledWith(1, 2)
		})
	})

	describe('useRemoveProjectMember', () => {
		it('should remove project member successfully', async () => {
			vi.mocked(projectService.removeProjectMember).mockResolvedValue()

			const { result } = renderHook(() => useRemoveProjectMember(), {
				wrapper: createWrapper()
			})

			result.current.mutate({ projectId: 1, userId: 2 })

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true)
			})

			expect(projectService.removeProjectMember).toHaveBeenCalledWith(1, 2)
		})
	})
})
