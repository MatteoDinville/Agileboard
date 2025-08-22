import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectService } from '../../services/project'
import { api } from '../../services/api'
import type { ProjectStatus, ProjectPriority } from '../../services/project'

vi.mock('../../services/api')

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

			vi.mocked(api.get).mockResolvedValue({ data: mockProjects })

			const result = await projectService.fetchProjects()

			expect(api.get).toHaveBeenCalledWith('/projects')
			expect(result).toEqual(mockProjects)
		})

		it('should throw error on fetch failure', async () => {
			vi.mocked(api.get).mockRejectedValue({
				response: { data: { error: 'Server error' } }
			})

			await expect(projectService.fetchProjects()).rejects.toThrow('Server error')
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

			vi.mocked(api.get).mockResolvedValue({ data: mockProject })

			const result = await projectService.fetchProjectById(1)

			expect(api.get).toHaveBeenCalledWith('/projects/1')
			expect(result).toEqual(mockProject)
		})

		it('should throw error when project not found', async () => {
			vi.mocked(api.get).mockRejectedValue({
				response: { data: { error: 'Project not found' } }
			})

			await expect(projectService.fetchProjectById(999)).rejects.toThrow('Project not found')
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

			vi.mocked(api.post).mockResolvedValue({ data: mockCreatedProject })

			const result = await projectService.createProject(projectData)

			expect(api.post).toHaveBeenCalledWith('/projects', projectData)
			expect(result).toEqual(mockCreatedProject)
		})

		it('should throw error on creation failure', async () => {
			const projectData = {
				title: 'New Project',
				description: 'New Description'
			}

			vi.mocked(api.post).mockRejectedValue({
				response: { data: { error: 'Failed to create project' } }
			})

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

			vi.mocked(api.put).mockResolvedValue({ data: mockUpdatedProject })

			const result = await projectService.updateProject(1, updateData)

			expect(api.put).toHaveBeenCalledWith('/projects/1', updateData)
			expect(result).toEqual(mockUpdatedProject)
		})

		it('should throw error on update failure', async () => {
			const updateData = {
				title: 'Updated Project'
			}

			vi.mocked(api.put).mockRejectedValue({
				response: { data: { error: 'Failed to update project' } }
			})

			await expect(projectService.updateProject(1, updateData)).rejects.toThrow('Failed to update project')
		})
	})

	describe('deleteProject', () => {
		it('should delete project successfully', async () => {
			vi.mocked(api.delete).mockResolvedValue({ data: {} })

			await projectService.deleteProject(1)

			expect(api.delete).toHaveBeenCalledWith('/projects/1')
		})

		it('should throw error on deletion failure', async () => {
			vi.mocked(api.delete).mockRejectedValue({
				response: { data: { error: 'Failed to delete project' } }
			})

			await expect(projectService.deleteProject(1)).rejects.toThrow('Failed to delete project')
		})
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

		vi.mocked(api.get).mockResolvedValue({ data: mockMembers })

		const result = await projectService.fetchProjectMembers(1)

		expect(api.get).toHaveBeenCalledWith('/projects/1/members')
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

		vi.mocked(api.post).mockResolvedValue({ data: mockAddedMember })

		const result = await projectService.addProjectMember(1, 3)

		expect(api.post).toHaveBeenCalledWith('/projects/1/members', { userId: 3 })
		expect(result).toEqual(mockAddedMember)
	})
})

describe('removeProjectMember', () => {
	it('should remove member from project successfully', async () => {
		vi.mocked(api.delete).mockResolvedValue({ data: {} })

		await projectService.removeProjectMember(1, 2)

		expect(api.delete).toHaveBeenCalledWith('/projects/1/members/2')
	})
})
