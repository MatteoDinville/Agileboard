import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import Backlog from '../../components/Backlog'
import { taskService } from '../../services/task'
import { TaskStatus, TaskPriority } from '../../types/enums'

vi.mock('@tanstack/react-query', () => ({
	useQuery: vi.fn(),
	useQueryClient: vi.fn(() => ({
		invalidateQueries: vi.fn(),
	})),
}))

vi.mock('../../services/task', () => ({
	taskService: {
		getProjectTasks: vi.fn(),
		deleteTask: vi.fn(),
	}
}))

const mockConfirm = vi.fn()
Object.defineProperty(window, 'confirm', {
	value: mockConfirm,
	writable: true,
})

const mockAlert = vi.fn()
Object.defineProperty(window, 'alert', {
	value: mockAlert,
	writable: true,
})

describe('Backlog', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockConfirm.mockReturnValue(true)
	})

	describe('Loading and error states', () => {
		it('shows loading state while tasks are loading', async () => {
			vi.mocked(useQuery).mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
				isError: false,
				isFetching: true,
				isSuccess: false,
				refetch: vi.fn(),
			} as unknown as ReturnType<typeof useQuery>)

			render(<Backlog projectId={1} />)

			await waitFor(() => {
				expect(screen.getByText('Chargement du backlog...')).toBeInTheDocument()
			})
		})

		it('shows error state when loading fails', async () => {
			vi.mocked(useQuery).mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error('Failed'),
				isError: true,
				isFetching: false,
				isSuccess: false,
				refetch: vi.fn(),
			} as unknown as ReturnType<typeof useQuery>)

			render(<Backlog projectId={1} />)

			await waitFor(() => {
				expect(screen.getByText('Erreur lors du chargement des tâches')).toBeInTheDocument()
			})
		})
	})

	describe('Empty state', () => {
		beforeEach(() => {
			vi.mocked(useQuery).mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
				isError: false,
				isFetching: false,
				isSuccess: true,
				refetch: vi.fn(),
			} as unknown as ReturnType<typeof useQuery>)
		})

		it('shows empty state when no tasks', async () => {
			render(<Backlog projectId={1} />)

			await waitFor(() => {
				expect(screen.getByText('Aucune tâche dans ce projet')).toBeInTheDocument()
				expect(screen.getByText('Commencez par créer votre première tâche')).toBeInTheDocument()
			})
		})

		it('shows create button and calls onCreateTask', async () => {
			const onCreateTask = vi.fn()
			render(<Backlog projectId={1} onCreateTask={onCreateTask} />)

			await waitFor(() => {
				expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument()
			})

			fireEvent.click(screen.getByText('Nouvelle tâche'))
			expect(onCreateTask).toHaveBeenCalled()
		})

		it('shows filtered empty message when filters are applied', async () => {
			render(<Backlog projectId={1} />)

			await waitFor(() => {
				expect(screen.getByText('Aucune tâche dans ce projet')).toBeInTheDocument()
			})
			fireEvent.change(screen.getByPlaceholderText('Rechercher une tâche...'), { target: { value: 'x' } })
			expect(screen.getByText('Aucune tâche ne correspond aux filtres')).toBeInTheDocument()
			expect(screen.getByText('Essayez de modifier les filtres pour voir plus de tâches')).toBeInTheDocument()
		})
	})

	describe('Tasks list, filters and actions', () => {
		const tasks = [
			{
				id: 1,
				title: 'Task A',
				description: 'Desc A',
				status: TaskStatus.A_FAIRE,
				priority: TaskPriority.HAUTE,
				dueDate: '2024-01-01',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				projectId: 1,
				assignedToId: 1,
				assignedTo: { id: 1, name: 'John Doe', email: 'john@example.com' },
			},
			{
				id: 2,
				title: 'Task B',
				description: 'Desc B',
				status: TaskStatus.EN_COURS,
				priority: TaskPriority.MOYENNE,
				dueDate: null,
				createdAt: '2024-01-02T00:00:00Z',
				updatedAt: '2024-01-02T00:00:00Z',
				projectId: 1,
				assignedToId: null,
				assignedTo: null,
			},
		]

		beforeEach(() => {
			vi.mocked(useQuery).mockReturnValue({
				data: tasks,
				isLoading: false,
				error: null,
				isError: false,
				isFetching: false,
				isSuccess: true,
				refetch: vi.fn(),
			} as unknown as ReturnType<typeof useQuery>)
		})

		it('renders tasks and header count', async () => {
			render(<Backlog projectId={1} />)

			await waitFor(() => {
				expect(screen.getByText('Task A')).toBeInTheDocument()
				expect(screen.getByText('Task B')).toBeInTheDocument()
			})

			expect(screen.getByText('2 tâches')).toBeInTheDocument()
			expect(screen.getAllByText('Non assigné').length).toBeGreaterThan(0)
			expect(screen.getAllByText('Aucune échéance').length).toBeGreaterThan(0)
		})

		it('filters by search, status, priority and assignee', async () => {
			render(<Backlog projectId={1} />)

			await waitFor(() => {
				expect(screen.getByText('Task A')).toBeInTheDocument()
			})

			fireEvent.change(screen.getByPlaceholderText('Rechercher une tâche...'), { target: { value: 'Task A' } })
			expect(screen.getByText('Task A')).toBeInTheDocument()
			expect(screen.queryByText('Task B')).not.toBeInTheDocument()

			fireEvent.change(screen.getByPlaceholderText('Rechercher une tâche...'), { target: { value: '' } })

			fireEvent.change(screen.getByDisplayValue('Tous les statuts'), { target: { value: TaskStatus.A_FAIRE } })
			expect(screen.getByText('Task A')).toBeInTheDocument()
			expect(screen.queryByText('Task B')).not.toBeInTheDocument()

			fireEvent.change(screen.getByDisplayValue('Toutes les priorités'), { target: { value: TaskPriority.HAUTE } })
			expect(screen.getByText('Task A')).toBeInTheDocument()

			fireEvent.change(screen.getByDisplayValue('À faire'), { target: { value: 'all' } })
			fireEvent.change(screen.getByDisplayValue('Haute'), { target: { value: 'all' } })

			fireEvent.change(screen.getByDisplayValue('Tous les membres'), { target: { value: 'unassigned' } })
			expect(screen.getByText('Task B')).toBeInTheDocument()
			expect(screen.queryByText('Task A')).not.toBeInTheDocument()
		})

		it('shows filtered count in header', async () => {
			render(<Backlog projectId={1} />)

			await waitFor(() => {
				expect(screen.getByText('2 tâches')).toBeInTheDocument()
			})

			fireEvent.change(screen.getByPlaceholderText('Rechercher une tâche...'), { target: { value: 'Task A' } })
			expect(screen.getByText('1 tâche sur 2 au total')).toBeInTheDocument()
		})

		it('supports sorting by title asc/desc', async () => {
			const { container } = render(<Backlog projectId={1} />)

			await waitFor(() => {
				expect(screen.getByText('Task A')).toBeInTheDocument()
			})

			const header = screen.getByText('Tâche')
			fireEvent.click(header)
			let rows = Array.from(container.querySelectorAll('tbody tr'))
			expect(rows[0].textContent).toContain('Task A')

			fireEvent.click(header)
			rows = Array.from(container.querySelectorAll('tbody tr'))
			expect(rows[0].textContent).toContain('Task B')
		})

		it('handles selection and bulk delete (confirm true)', async () => {
			vi.mocked(taskService.deleteTask).mockResolvedValue()
			render(<Backlog projectId={1} />)

			await waitFor(() => {
				expect(screen.getByText('2 tâches')).toBeInTheDocument()
			})

			const checkboxes = screen.getAllByRole('checkbox')
			fireEvent.click(checkboxes[1])
			expect(screen.getByText('(1 sélectionnée)')).toBeInTheDocument()

			fireEvent.click(screen.getByText('Supprimer (1)'))
			expect(mockConfirm).toHaveBeenCalled()
			await waitFor(() => {
				expect(taskService.deleteTask).toHaveBeenCalledWith(2)
			})
		})

		it('cancels bulk delete when confirm is false', async () => {
			mockConfirm.mockReturnValueOnce(false)
			render(<Backlog projectId={1} />)

			await waitFor(() => {
				expect(screen.getByText('2 tâches')).toBeInTheDocument()
			})

			const checkboxes = screen.getAllByRole('checkbox')
			fireEvent.click(checkboxes[1])
			fireEvent.click(screen.getByText('Supprimer (1)'))
			expect(taskService.deleteTask).not.toHaveBeenCalled()
		})

		it('calls onEditTask and onDeleteTask for row actions', async () => {
			const onEditTask = vi.fn()
			const onDeleteTask = vi.fn()

			render(<Backlog projectId={1} onEditTask={onEditTask} onDeleteTask={onDeleteTask} />)

			await waitFor(() => {
				expect(screen.getByText('Task A')).toBeInTheDocument()
			})

			const editButtons = screen.getAllByTitle('Modifier la tâche')
			fireEvent.click(editButtons[0])
			expect(onEditTask).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }))

			const deleteButtons = screen.getAllByTitle('Supprimer la tâche')
			fireEvent.click(deleteButtons[0])
			expect(onDeleteTask).toHaveBeenCalledWith(2)
		})

		it('bulk delete shows alert on error', async () => {
			vi.mocked(taskService.deleteTask).mockRejectedValueOnce(new Error('x'))
			const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { })
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

			render(<Backlog projectId={1} />)

			await waitFor(() => {
				expect(screen.getByText('2 tâches')).toBeInTheDocument()
			})

			const checkboxes = screen.getAllByRole('checkbox')
			fireEvent.click(checkboxes[1])
			fireEvent.click(screen.getByText('Supprimer (1)'))

			await waitFor(() => {
				expect(alertSpy).toHaveBeenCalled()
			})
			alertSpy.mockRestore()
			consoleSpy.mockRestore()
		})

		it('toggleSelectAll clears selection when all selected', async () => {
			render(<Backlog projectId={1} />)

			await waitFor(() => {
				expect(screen.getByText('2 tâches')).toBeInTheDocument()
			})

			const selectAll = screen.getAllByRole('checkbox')[0]
			fireEvent.click(selectAll)
			expect(screen.getByText('(2 sélectionnées)')).toBeInTheDocument()
			fireEvent.click(selectAll)
			expect(screen.queryByText('(2 sélectionnées)')).not.toBeInTheDocument()
		})
	})

	describe('Sorting functionality', () => {
		it('should test sorting by different fields', () => {
			const mockTasks = [
				{
					id: 1,
					title: 'Test Task',
					description: 'Test Description',
					status: TaskStatus.A_FAIRE,
					priority: TaskPriority.HAUTE,
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

			vi.mocked(useQuery).mockReturnValue({
				data: mockTasks,
				isLoading: false,
				error: null,
				isError: false,
				isFetching: false,
				isSuccess: true,
				refetch: vi.fn(),
			} as unknown as ReturnType<typeof useQuery>)

			render(<Backlog projectId={1} />)

			const statusHeader = screen.getByText('Statut')
			fireEvent.click(statusHeader)

			const priorityHeader = screen.getByText('Priorité')
			fireEvent.click(priorityHeader)

			expect(statusHeader).toBeInTheDocument()
			expect(priorityHeader).toBeInTheDocument()
		})

		it('should handle null/undefined values in sorting', async () => {
			const tasks = [
				{
					id: 1,
					title: 'Task with null values',
					description: 'Test Description',
					status: TaskStatus.A_FAIRE,
					priority: TaskPriority.HAUTE,
					dueDate: null,
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					projectId: 1,
					assignedToId: null,
					assignedTo: null
				}
			]

			vi.mocked(useQuery).mockReturnValue({
				data: tasks,
				isLoading: false,
				error: null,
				isError: false,
				isFetching: false,
				isSuccess: true,
				refetch: vi.fn(),
			} as unknown as ReturnType<typeof useQuery>)

			render(<Backlog projectId={1} />)

			const dueDateHeader = screen.getByText('Échéance')
			fireEvent.click(dueDateHeader)

			const assigneeHeader = screen.getByText('Assigné à')
			fireEvent.click(assigneeHeader)
		})
	})

	describe('Edge cases and error handling', () => {
		it('should handle delete task failure gracefully', async () => {
			const tasks = [
				{
					id: 1,
					title: 'Test Task',
					description: 'Test Description',
					status: TaskStatus.A_FAIRE,
					priority: TaskPriority.HAUTE,
					dueDate: null,
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					projectId: 1,
					assignedToId: null,
					assignedTo: null
				}
			]

			vi.mocked(useQuery).mockReturnValue({
				data: tasks,
				isLoading: false,
				error: null,
				isError: false,
				isFetching: false,
				isSuccess: true,
				refetch: vi.fn(),
			} as unknown as ReturnType<typeof useQuery>)

			vi.mocked(taskService.deleteTask).mockRejectedValue(new Error('Delete failed'))
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

			render(<Backlog projectId={1} />)

			const checkboxes = screen.getAllByRole('checkbox')
			const taskCheckbox = checkboxes[1]
			fireEvent.click(taskCheckbox)

			const deleteButton = screen.getByText('Supprimer (1)')
			fireEvent.click(deleteButton)

			await waitFor(() => {
				expect(mockAlert).toHaveBeenCalledWith('Erreur lors de la suppression des tâches')
			})
			consoleSpy.mockRestore()
		})

		it('should handle empty assignee filter correctly', async () => {
			render(<Backlog projectId={1} />)

			const assigneeSelect = screen.getByDisplayValue('Tous les membres')
			fireEvent.change(assigneeSelect, { target: { value: 'unassigned' } })

			expect(screen.getByText('Backlog')).toBeInTheDocument()
		})
	})
})
