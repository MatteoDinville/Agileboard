import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskModal from '../../components/TaskModal'
import { projectService } from '../../services/project'
import { TaskStatus, TaskPriority } from '../../types/enums'
import type { Task } from '../../services/task'

vi.mock('../../services/project', () => ({
	projectService: {
		fetchProjectMembers: vi.fn(),
	}
}))

const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

describe('TaskModal', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		consoleSpy.mockClear()
	})

	describe('Modal visibility', () => {
		it('should not render when isOpen is false', () => {
			render(
				<TaskModal
					isOpen={false}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			expect(screen.queryByText('Nouvelle tâche')).not.toBeInTheDocument()
		})

		it('should render when isOpen is true', () => {
			vi.mocked(projectService.fetchProjectMembers).mockResolvedValue([])

			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument()
		})
	})

	describe('Create mode', () => {
		beforeEach(() => {
			vi.mocked(projectService.fetchProjectMembers).mockResolvedValue([])
		})

		it('should show create task title and description', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument()
			expect(screen.getByText('Créez une nouvelle tâche pour votre projet')).toBeInTheDocument()
		})

		it('should initialize form with default values', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			const titleInput = screen.getByLabelText(/Titre de la tâche/)
			expect(titleInput).toHaveValue('')
			const descriptionTextarea = screen.getByLabelText('Description')
			expect(descriptionTextarea).toHaveValue('')
			const statusSelect = screen.getByLabelText('Statut')
			expect(statusSelect).toHaveValue(TaskStatus.A_FAIRE)
			const prioritySelect = screen.getByLabelText('Priorité')
			expect(prioritySelect).toHaveValue(TaskPriority.MOYENNE)
		})

		it('should show create button', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			expect(screen.getByText('Créer')).toBeInTheDocument()
		})
	})

	describe('Edit mode', () => {
		const mockTask: Task = {
			id: 1,
			title: 'Test Task',
			description: 'Test Description',
			status: TaskStatus.EN_COURS,
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

		beforeEach(() => {
			vi.mocked(projectService.fetchProjectMembers).mockResolvedValue([])
		})

		it('should show edit task title and description', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					task={mockTask}
					projectId={1}
				/>
			)

			expect(screen.getByText('Modifier la tâche')).toBeInTheDocument()
			expect(screen.getByText('Apportez des modifications à votre tâche')).toBeInTheDocument()
		})

		it('should populate form with task data', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					task={mockTask}
					projectId={1}
				/>
			)

			expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
			expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
			const statusSelect = screen.getByLabelText('Statut')
			expect(statusSelect).toHaveValue(TaskStatus.EN_COURS)
			const prioritySelect = screen.getByLabelText('Priorité')
			expect(prioritySelect).toHaveValue(TaskPriority.HAUTE)
			expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument()
		})

		it('should show edit button', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					task={mockTask}
					projectId={1}
				/>
			)

			expect(screen.getByText('Modifier')).toBeInTheDocument()
		})
	})

	describe('Form interactions', () => {
		beforeEach(() => {
			vi.mocked(projectService.fetchProjectMembers).mockResolvedValue([])
		})

		it('should handle title input change', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			const titleInput = screen.getByPlaceholderText('Ex: Implémenter la fonctionnalité de connexion')
			fireEvent.change(titleInput, { target: { value: 'New Task Title' } })

			expect(titleInput).toHaveValue('New Task Title')
		})

		it('should handle description input change', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			const descriptionInput = screen.getByPlaceholderText('Décrivez les détails de cette tâche...')
			fireEvent.change(descriptionInput, { target: { value: 'New Description' } })

			expect(descriptionInput).toHaveValue('New Description')
		})

		it('should handle status change', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			const statusSelect = screen.getByLabelText('Statut')
			fireEvent.change(statusSelect, { target: { value: TaskStatus.EN_COURS } })

			expect(statusSelect).toHaveValue(TaskStatus.EN_COURS)
		})

		it('should handle priority change', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			const prioritySelect = screen.getByLabelText('Priorité')
			fireEvent.change(prioritySelect, { target: { value: TaskPriority.HAUTE } })

			expect(prioritySelect).toHaveValue(TaskPriority.HAUTE)
		})

		it('should handle due date change', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			const dueDateInput = screen.getByLabelText('Date d\'échéance')
			fireEvent.change(dueDateInput, { target: { value: '2024-01-15' } })

			expect(dueDateInput).toHaveValue('2024-01-15')
		})
	})

	describe('Project members', () => {
		const mockMembers = [
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
			},
			{
				id: 2,
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
		]

		beforeEach(() => {
			vi.mocked(projectService.fetchProjectMembers).mockResolvedValue(mockMembers)
		})

		it('should load and display project members', async () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			await waitFor(() => {
				expect(screen.getByText('John Doe')).toBeInTheDocument()
				expect(screen.getByText('Jane Smith')).toBeInTheDocument()
			})

			expect(projectService.fetchProjectMembers).toHaveBeenCalledWith(1)
		})

		it('should handle assignee selection', async () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			await waitFor(() => {
				const assigneeSelect = screen.getByDisplayValue('Aucun utilisateur')
				fireEvent.change(assigneeSelect, { target: { value: '1' } })
				expect(assigneeSelect).toHaveValue('1')
			})
		})

		it('should handle error when loading members fails', async () => {
			vi.mocked(projectService.fetchProjectMembers).mockRejectedValue(new Error('Failed to load'))

			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			await waitFor(() => {
				expect(consoleSpy).toHaveBeenCalledWith('Erreur lors du chargement des membres du projet:', expect.any(Error))
			})
		})
	})

	describe('Form submission', () => {
		beforeEach(() => {
			vi.mocked(projectService.fetchProjectMembers).mockResolvedValue([])
		})

		it('should call onSave with form data when submitted', async () => {
			const mockOnSave = vi.fn().mockResolvedValue(undefined)

			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={mockOnSave}
					projectId={1}
				/>
			)

			const titleInput = screen.getByPlaceholderText('Ex: Implémenter la fonctionnalité de connexion')
			fireEvent.change(titleInput, { target: { value: 'Test Task' } })

			const submitButton = screen.getByText('Créer')
			fireEvent.click(submitButton)

			await waitFor(() => {
				expect(mockOnSave).toHaveBeenCalledWith({
					title: 'Test Task',
					description: undefined,
					status: TaskStatus.A_FAIRE,
					priority: TaskPriority.MOYENNE,
					dueDate: undefined,
					assignedToId: undefined,
					projectId: 1,
				})
			})
		})

		it('should disable submit button when title is empty', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			const submitButton = screen.getByText('Créer')
			expect(submitButton).toBeDisabled()
		})

		it('should enable submit button when title is filled', () => {
			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			const titleInput = screen.getByPlaceholderText('Ex: Implémenter la fonctionnalité de connexion')
			fireEvent.change(titleInput, { target: { value: 'Test Task' } })

			const submitButton = screen.getByText('Créer')
			expect(submitButton).not.toBeDisabled()
		})

		it('should handle error during submission', async () => {
			const mockOnSave = vi.fn().mockRejectedValue(new Error('Save failed'))

			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={mockOnSave}
					projectId={1}
				/>
			)

			const titleInput = screen.getByPlaceholderText('Ex: Implémenter la fonctionnalité de connexion')
			fireEvent.change(titleInput, { target: { value: 'Test Task' } })

			const submitButton = screen.getByText('Créer')
			fireEvent.click(submitButton)

			await waitFor(() => {
				expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de la sauvegarde:', expect.any(Error))
			})
		})
	})

	describe('Modal actions', () => {
		beforeEach(() => {
			vi.mocked(projectService.fetchProjectMembers).mockResolvedValue([])
		})

		it('should call onClose when cancel button is clicked', () => {
			const mockOnClose = vi.fn()

			render(
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			const cancelButton = screen.getByText('Annuler')
			fireEvent.click(cancelButton)

			expect(mockOnClose).toHaveBeenCalled()
		})

		it('should call onClose when close button is clicked', () => {
			const mockOnClose = vi.fn()

			render(
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					onSave={vi.fn()}
					projectId={1}
				/>
			)

			const closeButton = screen.getByRole('button', { name: '' })
			fireEvent.click(closeButton)

			expect(mockOnClose).toHaveBeenCalled()
		})
	})

	describe('Task with status only', () => {
		beforeEach(() => {
			vi.mocked(projectService.fetchProjectMembers).mockResolvedValue([])
		})

		it('should initialize form with provided status', () => {
			const taskWithStatus = {
				status: TaskStatus.EN_COURS
			}

			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={vi.fn()}
					task={taskWithStatus as any}
					projectId={1}
				/>
			)

			const statusSelect = screen.getByLabelText('Statut')
			expect(statusSelect).toHaveValue(TaskStatus.EN_COURS)

			const prioritySelect = screen.getByLabelText('Priorité')
			expect(prioritySelect).toHaveValue(TaskPriority.MOYENNE)
		})
	})

	describe('Loading states', () => {
		beforeEach(() => {
			vi.mocked(projectService.fetchProjectMembers).mockResolvedValue([])
		})

		it('should show loading state during submission', async () => {
			let resolvePromise: (value: any) => void
			const mockOnSave = vi.fn().mockImplementation(() => new Promise(resolve => {
				resolvePromise = resolve
			}))

			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={mockOnSave}
					projectId={1}
				/>
			)

			const titleInput = screen.getByPlaceholderText('Ex: Implémenter la fonctionnalité de connexion')
			fireEvent.change(titleInput, { target: { value: 'Test Task' } })

			const submitButton = screen.getByText('Créer')
			fireEvent.click(submitButton)

			await waitFor(() => {
				expect(screen.getByText('Création...')).toBeInTheDocument()
			})

			resolvePromise!({})
		})

		it('should show loading state during edit submission', async () => {
			const mockTask: Task = {
				id: 1,
				title: 'Test Task',
				description: 'Test Description',
				status: TaskStatus.A_FAIRE,
				priority: TaskPriority.MOYENNE,
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				projectId: 1
			}

			let resolvePromise: (value: any) => void
			const mockOnSave = vi.fn().mockImplementation(() => new Promise(resolve => {
				resolvePromise = resolve
			}))

			render(
				<TaskModal
					isOpen={true}
					onClose={vi.fn()}
					onSave={mockOnSave}
					task={mockTask}
					projectId={1}
				/>
			)

			const submitButton = screen.getByText('Modifier')
			fireEvent.click(submitButton)

			await waitFor(() => {
				expect(screen.getByText('Modification...')).toBeInTheDocument()
			})

			resolvePromise!({})
		})
	})
})
