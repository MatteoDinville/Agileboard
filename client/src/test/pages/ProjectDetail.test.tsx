import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProjectDetail from '../../pages/ProjectDetail'
import { useProject, useProjectMembers } from '../../utils/hooks/project'
import { taskService } from '../../services/task'

vi.mock('@tanstack/react-router', () => ({
	useParams: () => ({ projectId: '1' }),
	Link: ({ children, to, ...props }: any) => (
		<a href={to} {...props}>{children}</a>
	),
}))

vi.mock('../../utils/hooks/project')
vi.mock('../../services/task')


vi.mock('@tanstack/react-query', async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...(actual as any),
		QueryClient: (actual as any).QueryClient,
		QueryClientProvider: (actual as any).QueryClientProvider,
	}
})
vi.mock('../../components/MembersListOnly', () => ({
	default: ({ projectId, isOwner }: any) => (
		<div data-testid="members-list" data-project-id={projectId} data-is-owner={isOwner}>
			Members List Component
		</div>
	),
}))
vi.mock('../../components/KanbanBoard', () => ({
	default: ({ projectId }: any) => (
		<div data-testid="kanban-board" data-project-id={projectId}>
			Kanban Board Component
		</div>
	),
}))
vi.mock('../../components/Backlog', () => ({
	default: ({ projectId, onEditTask, onDeleteTask, onCreateTask }: any) => (
		<div data-testid="backlog" data-project-id={projectId}>
			Backlog Component
			<button onClick={() => onEditTask({ id: 1, title: 'Test Task' })}>Edit Task</button>
			<button onClick={() => onDeleteTask(1)}>Delete Task</button>
			<button onClick={onCreateTask}>Create Task</button>
		</div>
	),
}))
vi.mock('../../components/TaskModal', () => ({
	default: ({ isOpen, onClose, task, onSave, projectId }: any) => (
		isOpen ? (
			<div data-testid="task-modal" data-project-id={projectId}>
				Task Modal
				<button onClick={onClose}>Close</button>
				<button onClick={() => onSave({ title: 'New Task', description: 'Description' })}>Save</button>
			</div>
		) : null
	),
}))


vi.mock('lucide-react', () => ({
	ArrowLeft: () => <div data-testid="arrow-left">ArrowLeft</div>,
	Edit3: () => <div data-testid="edit3">Edit3</div>,
	Calendar: () => <div data-testid="calendar">Calendar</div>,
	AlertCircle: () => <div data-testid="alert-circle">AlertCircle</div>,
	Loader2: () => <div data-testid="loader2">Loader2</div>,
	FolderOpen: () => <div data-testid="folder-open">FolderOpen</div>,
	LayoutGrid: () => <div data-testid="layout-grid">LayoutGrid</div>,
	Users: () => <div data-testid="users">Users</div>,
	List: () => <div data-testid="list">List</div>,
}))

const mockProject = {
	id: 1,
	title: 'Test Project',
	description: 'Test project description',
	status: 'En cours',
	priority: 'Haute',
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-02T00:00:00Z',
}

const mockMembers = [
	{
		user: {
			id: 1,
			name: 'John Doe',
			email: 'john@example.com',
		},
	},
	{
		user: {
			id: 2,
			name: 'Jane Smith',
			email: 'jane@example.com',
		},
	},
]

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	})
	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	)
}

describe('ProjectDetail', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		global.confirm = vi.fn(() => true)
		global.alert = vi.fn()
	})

	it('should render loading state', () => {
		vi.mocked(useProject).mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: undefined,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		expect(screen.getByTestId('loader2')).toBeInTheDocument()
		expect(screen.getByText('Chargement du projet…')).toBeInTheDocument()
	})

	it('should render error state', () => {
		vi.mocked(useProject).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			error: { message: 'Project not found' },
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: undefined,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		expect(screen.getByTestId('alert-circle')).toBeInTheDocument()
		expect(screen.getByText('Projet introuvable')).toBeInTheDocument()
		expect(screen.getByText('Project not found')).toBeInTheDocument()
		expect(screen.getByText('Retour aux projets')).toBeInTheDocument()
	})

	it('should render project details in overview tab', () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		expect(screen.getByText('Test Project')).toBeInTheDocument()
		expect(screen.getByText('Test project description')).toBeInTheDocument()
		expect(screen.getByText('Vue d\'ensemble')).toBeInTheDocument()
		expect(screen.getByText('Kanban')).toBeInTheDocument()
		expect(screen.getByText('Backlog')).toBeInTheDocument()
		expect(screen.getByText('Membres')).toBeInTheDocument()
	})

	it('should switch to kanban tab', async () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const kanbanTab = screen.getByText('Kanban')
		fireEvent.click(kanbanTab)

		await waitFor(() => {
			expect(screen.getByTestId('kanban-board')).toBeInTheDocument()
		})
	})

	it('should switch to backlog tab', async () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const backlogTab = screen.getByText('Backlog')
		fireEvent.click(backlogTab)

		await waitFor(() => {
			expect(screen.getByTestId('backlog')).toBeInTheDocument()
		})
	})

	it('should switch to members tab', async () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const membersTab = screen.getByText('Membres')
		fireEvent.click(membersTab)

		await waitFor(() => {
			expect(screen.getByTestId('members-list')).toBeInTheDocument()
		})
	})

	it('should open task modal when creating task from backlog', async () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const backlogTab = screen.getByText('Backlog')
		fireEvent.click(backlogTab)

		await waitFor(() => {
			expect(screen.getByTestId('backlog')).toBeInTheDocument()
		})

		const createTaskButton = screen.getByText('Create Task')
		fireEvent.click(createTaskButton)

		await waitFor(() => {
			expect(screen.getByTestId('task-modal')).toBeInTheDocument()
		})
	})

	it('should handle task deletion', async () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)
		vi.mocked(taskService.deleteTask).mockResolvedValue(undefined)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const backlogTab = screen.getByText('Backlog')
		fireEvent.click(backlogTab)

		await waitFor(() => {
			expect(screen.getByTestId('backlog')).toBeInTheDocument()
		})

		const deleteTaskButton = screen.getByText('Delete Task')
		fireEvent.click(deleteTaskButton)

		expect(global.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer cette tâche ?')
		expect(taskService.deleteTask).toHaveBeenCalledWith(1)
	})

	it('should display project status and priority badges', () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		expect(screen.getByText('En cours')).toBeInTheDocument()
		expect(screen.getByText('Priorité Haute')).toBeInTheDocument()
		expect(screen.getByText('2 Membres')).toBeInTheDocument()
	})

	it('should display member information in sidebar', () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		expect(screen.getByText('John Doe')).toBeInTheDocument()
		expect(screen.getByText('john@example.com')).toBeInTheDocument()
		expect(screen.getByText('Jane Smith')).toBeInTheDocument()
		expect(screen.getByText('jane@example.com')).toBeInTheDocument()
	})

	it('should display empty state when no members', () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: [],
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		expect(screen.getByText('Aucun membre')).toBeInTheDocument()
		expect(screen.getByText('0 Membre')).toBeInTheDocument()
	})

	it('should handle task editing from backlog', async () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const backlogTab = screen.getByText('Backlog')
		fireEvent.click(backlogTab)

		await waitFor(() => {
			expect(screen.getByTestId('backlog')).toBeInTheDocument()
		})

		const editTaskButton = screen.getByText('Edit Task')
		fireEvent.click(editTaskButton)

		await waitFor(() => {
			expect(screen.getByTestId('task-modal')).toBeInTheDocument()
		})
	})

	it('should handle task saving for new task', async () => {
		const mockQueryClient = {
			invalidateQueries: vi.fn(),
		}
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)
		vi.mocked(taskService.createTask).mockResolvedValue({ id: 1, title: 'New Task' } as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const backlogTab = screen.getByText('Backlog')
		fireEvent.click(backlogTab)

		await waitFor(() => {
			expect(screen.getByTestId('backlog')).toBeInTheDocument()
		})

		const createTaskButton = screen.getByText('Create Task')
		fireEvent.click(createTaskButton)

		await waitFor(() => {
			expect(screen.getByTestId('task-modal')).toBeInTheDocument()
		})

		const saveButton = screen.getByText('Save')
		fireEvent.click(saveButton)

		await waitFor(() => {
			expect(taskService.createTask).toHaveBeenCalledWith(1, {
				title: 'New Task',
				description: 'Description',
				status: 'A_FAIRE',
				priority: undefined,
				dueDate: undefined,
				assignedToId: undefined,
			})
		})
	})

	it('should handle task saving for existing task', async () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)
		vi.mocked(taskService.updateTask).mockResolvedValue({ id: 1, title: 'Updated Task' } as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const backlogTab = screen.getByText('Backlog')
		fireEvent.click(backlogTab)

		await waitFor(() => {
			expect(screen.getByTestId('backlog')).toBeInTheDocument()
		})

		const editTaskButton = screen.getByText('Edit Task')
		fireEvent.click(editTaskButton)

		await waitFor(() => {
			expect(screen.getByTestId('task-modal')).toBeInTheDocument()
		})

		const saveButton = screen.getByText('Save')
		fireEvent.click(saveButton)

		await waitFor(() => {
			expect(taskService.updateTask).toHaveBeenCalledWith(1, {
				title: 'New Task',
				description: 'Description',
				status: undefined,
				priority: undefined,
				dueDate: undefined,
				assignedToId: undefined,
			})
		})
	})

	it('should handle task deletion cancellation', async () => {
		global.confirm = vi.fn(() => false)
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const backlogTab = screen.getByText('Backlog')
		fireEvent.click(backlogTab)

		await waitFor(() => {
			expect(screen.getByTestId('backlog')).toBeInTheDocument()
		})

		const deleteTaskButton = screen.getByText('Delete Task')
		fireEvent.click(deleteTaskButton)

		expect(global.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer cette tâche ?')
		expect(taskService.deleteTask).not.toHaveBeenCalled()
	})

	it('should handle task deletion error', async () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)
		vi.mocked(taskService.deleteTask).mockRejectedValue(new Error('Delete failed'))

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const backlogTab = screen.getByText('Backlog')
		fireEvent.click(backlogTab)

		await waitFor(() => {
			expect(screen.getByTestId('backlog')).toBeInTheDocument()
		})

		const deleteTaskButton = screen.getByText('Delete Task')
		fireEvent.click(deleteTaskButton)

		await waitFor(() => {
			expect(taskService.deleteTask).toHaveBeenCalledWith(1)
			expect(global.alert).toHaveBeenCalledWith('Erreur lors de la suppression de la tâche')
		})
	})

	it('should handle task save error', async () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)
		vi.mocked(taskService.createTask).mockRejectedValue(new Error('Save failed'))

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const backlogTab = screen.getByText('Backlog')
		fireEvent.click(backlogTab)

		await waitFor(() => {
			expect(screen.getByTestId('backlog')).toBeInTheDocument()
		})

		const createTaskButton = screen.getByText('Create Task')
		fireEvent.click(createTaskButton)

		await waitFor(() => {
			expect(screen.getByTestId('task-modal')).toBeInTheDocument()
		})

		const saveButton = screen.getByText('Save')
		fireEvent.click(saveButton)

		await waitFor(() => {
			expect(global.alert).toHaveBeenCalledWith('Erreur lors de la sauvegarde de la tâche')
		})
	})

	it('should close task modal on close button click', async () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const backlogTab = screen.getByText('Backlog')
		fireEvent.click(backlogTab)

		await waitFor(() => {
			expect(screen.getByTestId('backlog')).toBeInTheDocument()
		})

		const createTaskButton = screen.getByText('Create Task')
		fireEvent.click(createTaskButton)

		await waitFor(() => {
			expect(screen.getByTestId('task-modal')).toBeInTheDocument()
		})

		const closeButton = screen.getByText('Close')
		fireEvent.click(closeButton)

		await waitFor(() => {
			expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()
		})
	})

	it('should handle projects with undefined status and priority', () => {
		const projectWithUndefined = {
			...mockProject,
			status: undefined,
			priority: undefined,
		}

		vi.mocked(useProject).mockReturnValue({
			data: projectWithUndefined,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		expect(screen.getByText('Non défini')).toBeInTheDocument()
		expect(screen.getByText('Priorité Non définie')).toBeInTheDocument()
	})

	it('should handle projects with null description', () => {
		const projectWithNullDescription = {
			...mockProject,
			description: null,
		}

		vi.mocked(useProject).mockReturnValue({
			data: projectWithNullDescription,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		expect(screen.getByText('Aucune description fournie pour ce projet. Ajoutez une description pour mieux expliquer les objectifs et le contexte de ce projet.')).toBeInTheDocument()
	})

	it('should navigate between tabs using action buttons', async () => {
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		const kanbanActionButton = screen.getByText('Voir le Kanban').closest('button')
		fireEvent.click(kanbanActionButton!)

		await waitFor(() => {
			expect(screen.getByTestId('kanban-board')).toBeInTheDocument()
		})

		const overviewTab = screen.getByText('Vue d\'ensemble')
		fireEvent.click(overviewTab)

		const backlogActionButton = screen.getByText('Voir le Backlog').closest('button')
		fireEvent.click(backlogActionButton!)

		await waitFor(() => {
			expect(screen.getByTestId('backlog')).toBeInTheDocument()
		})

		fireEvent.click(overviewTab)

		const membersActionButton = screen.getByText('Gérer l\'équipe').closest('button')
		fireEvent.click(membersActionButton!)

		await waitFor(() => {
			expect(screen.getByTestId('members-list')).toBeInTheDocument()
		})
	})

	it('should show "see all members" link when there are more than 3 members', async () => {
		const manyMembers = [
			...mockMembers,
			{ user: { id: 3, name: 'Alice Johnson', email: 'alice@example.com' } },
			{ user: { id: 4, name: 'Bob Wilson', email: 'bob@example.com' } },
		]

		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: manyMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		expect(screen.getByText('Voir tous les membres (4)')).toBeInTheDocument()

		const seeAllMembersLink = screen.getByText('Voir tous les membres (4)')
		fireEvent.click(seeAllMembersLink)

		await waitFor(() => {
			expect(screen.getByTestId('members-list')).toBeInTheDocument()
		})
	})

	it('should handle members without names', () => {
		const membersWithoutNames = [
			{
				user: {
					id: 1,
					name: null,
					email: 'nomaname@example.com',
				},
			},
		]

		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: membersWithoutNames,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		expect(screen.getByText('Utilisateur')).toBeInTheDocument()
		expect(screen.getByText('nomaname@example.com')).toBeInTheDocument()
	})

	it('should show different date when project was updated', () => {
		const projectWithDifferentUpdateDate = {
			...mockProject,
			updatedAt: '2024-02-01T00:00:00Z', // Different from createdAt
		}

		vi.mocked(useProject).mockReturnValue({
			data: projectWithDifferentUpdateDate,
			isLoading: false,
			isError: false,
			error: null,
		} as any)
		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
		} as any)

		render(<ProjectDetail />, { wrapper: createWrapper() })

		expect(screen.getByText('Créé le')).toBeInTheDocument()
		expect(screen.getByText('Modifié le')).toBeInTheDocument()
	})
})
