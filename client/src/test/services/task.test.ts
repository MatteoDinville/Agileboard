import { describe, it, expect, vi, beforeEach } from 'vitest'
import { taskService, type Task, type CreateTaskData, type UpdateTaskData } from '../../services/task'
import { TaskStatus, TaskPriority } from '../../types/enums'

global.fetch = vi.fn()

describe('Task Service', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getProjectTasks', () => {
		it('should fetch project tasks successfully', async () => {
			const mockTasks: Task[] = [
				{
					id: 1,
					title: 'Test Task',
					description: 'Test Description',
					status: TaskStatus.A_FAIRE,
					priority: TaskPriority.MOYENNE,
					dueDate: '2024-01-01',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					projectId: 1,
					assignedToId: 1,
					assignedTo: {
						id: 1,
						name: 'John Doe',
						email: 'john@example.com'
					}
				}
			]

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTasks)
			} as unknown as Response)

			const result = await taskService.getProjectTasks(1)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/tasks/project/1',
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				})
			expect(result).toEqual(mockTasks)
		})

		it('should handle error when fetching project tasks fails', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Failed to fetch tasks' })
			} as unknown as Response)

			await expect(taskService.getProjectTasks(1)).rejects.toThrow('Failed to fetch tasks')
		})

		it('should handle error without error message', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({})
			} as unknown as Response)

			await expect(taskService.getProjectTasks(1)).rejects.toThrow('Erreur lors de la récupération des tâches')
		})
	})

	describe('createTask', () => {
		it('should create task successfully', async () => {
			const mockTask: Task = {
				id: 1,
				title: 'New Task',
				description: 'New Description',
				status: TaskStatus.A_FAIRE,
				priority: TaskPriority.HAUTE,
				dueDate: '2024-01-01',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				projectId: 1
			}

			const createData: CreateTaskData = {
				title: 'New Task',
				description: 'New Description',
				priority: TaskPriority.HAUTE,
				dueDate: '2024-01-01'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTask)
			} as unknown as Response)

			const result = await taskService.createTask(1, createData)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/tasks/project/1',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify(createData),
				})
			expect(result).toEqual(mockTask)
		})

		it('should handle error when creating task fails', async () => {
			const createData: CreateTaskData = {
				title: 'New Task'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Failed to create task' })
			} as unknown as Response)

			await expect(taskService.createTask(1, createData)).rejects.toThrow('Failed to create task')
		})
	})

	describe('updateTask', () => {
		it('should update task successfully', async () => {
			const mockTask: Task = {
				id: 1,
				title: 'Updated Task',
				description: 'Updated Description',
				status: TaskStatus.EN_COURS,
				priority: TaskPriority.BASSE,
				dueDate: '2024-01-02',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				projectId: 1
			}

			const updateData: UpdateTaskData = {
				title: 'Updated Task',
				status: TaskStatus.EN_COURS,
				priority: TaskPriority.BASSE
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTask)
			} as unknown as Response)

			const result = await taskService.updateTask(1, updateData)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/tasks/1',
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify(updateData),
				})
			expect(result).toEqual(mockTask)
		})

		it('should handle error when updating task fails', async () => {
			const updateData: UpdateTaskData = {
				title: 'Updated Task'
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Failed to update task' })
			} as unknown as Response)

			await expect(taskService.updateTask(1, updateData)).rejects.toThrow('Failed to update task')
		})
	})

	describe('deleteTask', () => {
		it('should delete task successfully', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: true
			} as unknown as Response)

			await taskService.deleteTask(1)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/tasks/1',
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				})
		})

		it('should handle error when deleting task fails', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Failed to delete task' })
			} as unknown as Response)

			await expect(taskService.deleteTask(1)).rejects.toThrow('Failed to delete task')
		})
	})

	describe('updateTaskStatus', () => {
		it('should update task status successfully', async () => {
			const mockTask: Task = {
				id: 1,
				title: 'Test Task',
				description: 'Test Description',
				status: TaskStatus.TERMINEE,
				priority: TaskPriority.MOYENNE,
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				projectId: 1
			}

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTask)
			} as unknown as Response)

			const result = await taskService.updateTaskStatus(1, TaskStatus.TERMINEE)

			expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/tasks/1/status',
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({ status: TaskStatus.TERMINEE }),
				})
			expect(result).toEqual(mockTask)
		})

		it('should handle error when updating task status fails', async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Failed to update status' })
			} as unknown as Response)

			await expect(taskService.updateTaskStatus(1, TaskStatus.TERMINEE)).rejects.toThrow('Failed to update status')
		})
	})
})
