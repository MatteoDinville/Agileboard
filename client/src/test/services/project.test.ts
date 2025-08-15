import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectService } from '../../services/project'
import type { ProjectStatus, ProjectPriority } from '../../services/project'

global.fetch = vi.fn()

describe('Project Service', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('fetchProjects', () => {
		it('should fetch projects successfully', async () => {
			const mockProjects = [
				{
					id: 1,
					title: 'Project 1',
					description: 'Description 1',
					status: 'En cours' as ProjectStatus,
					priority: 'Moyenne' as ProjectPriority,
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z'
				},
				{
					id: 2,
					title: 'Project 2',
					description: 'Description 2',
					status: 'Terminé' as ProjectStatus,
					priority: 'Haute' as ProjectPriority,
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z'
				}
			]

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockProjects)
			} as unknown as Response)

			const result = await projectService.fetchProjects()

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/projects',
				{
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				})
			expect(result).toEqual(mockProjects)
		})

		it('should throw error on fetch failure', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				status: 500
			} as Response)

			await expect(projectService.fetchProjects()).rejects.toThrow('Erreur lors de la récupération des projets')
		})
	})

	describe('fetchProjectById', () => {
		it('should fetch single project successfully', async () => {
			const mockProject = {
				id: 1,
				title: 'Test Project',
				description: 'Test Description',
				status: 'En cours' as ProjectStatus,
				priority: 'Moyenne' as ProjectPriority,
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockProject)
			} as unknown as Response)

			const result = await projectService.fetchProjectById(1)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/projects/1',
				{
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				})
			expect(result).toEqual(mockProject)
		})

		it('should throw error when project not found', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				status: 404
			} as Response)

			await expect(projectService.fetchProjectById(999)).rejects.toThrow('Erreur : Projet introuvable ou accès refusé')
		})
	})

	describe('createProject', () => {
		it('should create project successfully', async () => {
			const projectData = {
				title: 'New Project',
				description: 'New Description',
				status: 'En cours' as ProjectStatus,
				priority: 'Moyenne' as ProjectPriority
			}

			const mockCreatedProject = {
				id: 1,
				...projectData,
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockCreatedProject)
			} as unknown as Response)

			const result = await projectService.createProject(projectData)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/projects',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify(projectData)
				})
			expect(result).toEqual(mockCreatedProject)
		})

		it('should throw error on creation failure', async () => {
			const projectData = {
				title: 'New Project',
				description: 'New Description'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Failed to create project' })
			} as unknown as Response)

			await expect(projectService.createProject(projectData)).rejects.toThrow('Failed to create project')
		})
	})

	describe('updateProject', () => {
		it('should update project successfully', async () => {
			const updateData = {
				title: 'Updated Project',
				description: 'Updated Description'
			}

			const mockUpdatedProject = {
				id: 1,
				...updateData,
				status: 'En cours' as ProjectStatus,
				priority: 'Moyenne' as ProjectPriority,
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockUpdatedProject)
			} as unknown as Response)

			const result = await projectService.updateProject(1, updateData)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/projects/1',
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify(updateData)
				})
			expect(result).toEqual(mockUpdatedProject)
		})

		it('should throw error on update failure', async () => {
			const updateData = {
				title: 'Updated Project'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Failed to update project' })
			} as unknown as Response)

			await expect(projectService.updateProject(1, updateData)).rejects.toThrow('Failed to update project')
		})
	})

	describe('deleteProject', () => {
		it('should delete project successfully', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: true
			} as unknown as Response)

			await projectService.deleteProject(1)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/projects/1',
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				})
		})

		it('should throw error on deletion failure', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Failed to delete project' })
			} as unknown as Response)

			await expect(projectService.deleteProject(1)).rejects.toThrow('Failed to delete project')
		})
	})

	describe('fetchProjectMembers', () => {
		it('should fetch project members successfully', async () => {
			const mockMembers = [
				{
					id: 1,
					userId: 1,
					projectId: 1,
					addedAt: '2024-01-01T00:00:00Z',
					user: {
						id: 1,
						name: 'John Doe',
						email: 'john@example.com'
					}
				},
				{
					id: 2,
					userId: 2,
					projectId: 1,
					addedAt: '2024-01-01T00:00:00Z',
					user: {
						id: 2,
						name: 'Jane Smith',
						email: 'jane@example.com'
					}
				}
			]

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockMembers)
			} as unknown as Response)

			const result = await projectService.fetchProjectMembers(1)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/projects/1/members',
				{
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				})
			expect(result).toEqual(mockMembers)
		})
	})

	describe('addProjectMember', () => {
		it('should add member to project successfully', async () => {
			const mockAddedMember = {
				id: 3,
				userId: 3,
				projectId: 1,
				addedAt: '2024-01-01T00:00:00Z',
				user: {
					id: 3,
					name: 'New Member',
					email: 'newmember@example.com'
				}
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockAddedMember)
			} as unknown as Response)

			const result = await projectService.addProjectMember(1, 3)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/projects/1/members',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({ userId: 3 })
				})
			expect(result).toEqual(mockAddedMember)
		})
	})

	describe('removeProjectMember', () => {
		it('should remove member from project successfully', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: true
			} as unknown as Response)

			await projectService.removeProjectMember(1, 2)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/projects/1/members/2',
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				})
		})
	})
})
