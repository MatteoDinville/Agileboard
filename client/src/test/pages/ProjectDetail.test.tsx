import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import { ThemeProvider } from '../../contexts/ThemeContext'
import ProjectDetail from '../../pages/ProjectDetail'
import { taskService } from '../../services/task'
import { authService } from '../../services/auth'
import { TaskStatus, TaskPriority } from '../../types/enums'
import type { Project, ProjectMember } from '../../services/project'

vi.mock('react-hot-toast', () => ({
	default: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
		dismiss: vi.fn(),
	},
}))

vi.mock('../../utils/hooks/project', () => ({
	useProject: vi.fn(),
	useProjectMembers: vi.fn(),
}))

vi.mock('lucide-react', () => ({
	ArrowLeft: () => <div data-testid="arrow-left" />,
	Crown: () => <div data-testid="crown" />,
	UserCheck: () => <div data-testid="user-check" />,
	Settings: () => <div data-testid="settings" />,
	Users: () => <div data-testid="users" />,
	Calendar: () => <div data-testid="calendar" />,
	FolderKanban: () => <div data-testid="folder-kanban" />,
	ClipboardList: () => <div data-testid="clipboard-list" />,
	Plus: () => <div data-testid="plus" />,
	Edit: () => <div data-testid="edit" />,
	Trash2: () => <div data-testid="trash" />,
	X: () => <div data-testid="x" />,
	Save: () => <div data-testid="save" />,
	ChevronDown: () => <div data-testid="chevron-down" />,
	Edit3: () => <div data-testid="edit3" />,
	AlertCircle: () => <div data-testid="alert-circle" />,
	FolderOpen: () => <div data-testid="folder-open" />,
	LayoutGrid: () => <div data-testid="layout-grid" />,
	List: () => <div data-testid="list" />,
	LoaderCircle: ({ className }: { className?: string }) => <svg className={className} data-testid="loader-circle"><circle /></svg>,
}))

vi.mock('../../components/ThemeToggle', () => ({
	default: () => <div data-testid="theme-toggle" />
}))

vi.mock('../../services/project', () => ({
	projectService: {
		fetchProjectById: vi.fn(),
		fetchProjectMembers: vi.fn(),
		createProject: vi.fn(),
		updateProject: vi.fn(),
		deleteProject: vi.fn(),
		fetchProjects: vi.fn(),
	},
}))

vi.mock('../../services/task', () => ({
	taskService: {
		createTask: vi.fn(),
		updateTask: vi.fn(),
		deleteTask: vi.fn(),
		fetchTasks: vi.fn(),
	},
}))

vi.mock('../../services/auth', () => ({
	authService: {
		getCurrentUser: vi.fn(),
		login: vi.fn(),
		logout: vi.fn(),
		register: vi.fn(),
	},
}))

vi.mock('../../components/KanbanBoard', () => ({
	default: ({ projectId }: { projectId: number }) => (
		<div data-testid="kanban-board">KanbanBoard for project {projectId}</div>
	),
}))

vi.mock('../../components/Backlog', () => ({
	default: ({ projectId, onEditTask, onDeleteTask, onCreateTask }: {
		projectId: number
		onEditTask: (task: { id: number; title: string }) => void
		onDeleteTask: (taskId: number) => void
		onCreateTask: () => void
	}) => (
		<div data-testid="backlog">
			<div>Backlog for project {projectId}</div>
			<button onClick={onCreateTask} data-testid="create-task-btn">Create Task</button>
			<button onClick={() => onEditTask({ id: 1, title: 'Test Task' })} data-testid="edit-task-btn">Edit Task</button>
			<button onClick={() => onDeleteTask(1)} data-testid="delete-task-btn">Delete Task</button>
		</div>
	),
}))

vi.mock('../../components/MembersListOnly', () => ({
	default: ({ projectId, isOwner }: { projectId: number; isOwner: boolean }) => (
		<div data-testid="members-list">
			<div>Members for project {projectId}</div>
			<div>Owner: {isOwner ? 'true' : 'false'}</div>
		</div>
	),
}))

vi.mock('../../components/TaskModal', () => ({
	default: ({ isOpen, onClose, task, onSave, projectId }: {
		isOpen: boolean
		onClose: () => void
		task?: { title: string } | null
		onSave: (data: { title: string }) => void
		projectId: number
	}) => (
		isOpen ? (
			<div data-testid="task-modal">
				<div>Task Modal for project {projectId}</div>
				<div>Task: {task ? task.title : 'New Task'}</div>
				<button onClick={onClose} data-testid="close-modal">Close</button>
				<button onClick={() => onSave({ title: 'Saved Task' })} data-testid="save-task">Save</button>
			</div>
		) : null
	),
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', async () => {
	const actual = await vi.importActual('@tanstack/react-router')
	return {
		...actual,
		useParams: vi.fn(() => ({ projectId: '1' })),
		Link: ({ children, to, ...props }: { children: React.ReactNode; to: string;[key: string]: unknown }) => (
			<a href={to} {...props}>{children}</a>
		),
		useNavigate: () => mockNavigate,
	}
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				staleTime: 0,
				gcTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	})

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<AuthProvider>
					{children}
				</AuthProvider>
			</ThemeProvider>
		</QueryClientProvider>
	)
}

describe('ProjectDetail', () => {
	const mockUser = {
		id: 1,
		email: 'test@example.com',
		name: 'Test User',
	}

	const mockProject: Project = {
		id: 1,
		title: 'Test Project',
		description: 'Test project description',
		status: 'En cours',
		priority: 'Haute',
		createdAt: '2025-01-01T00:00:00.000Z',
		updatedAt: '2025-01-02T00:00:00.000Z',
		ownerId: 1,
		members: [],
	}

	const mockMembers: ProjectMember[] = [
		{
			id: 1,
			userId: 1,
			projectId: 1,
			addedAt: '2025-01-01T00:00:00.000Z',
			user: {
				id: 1,
				email: 'user1@test.com',
				name: 'User One',
			},
		},
		{
			id: 2,
			userId: 2,
			projectId: 1,
			addedAt: '2025-01-01T00:00:00.000Z',
			user: {
				id: 2,
				email: 'user2@test.com',
				name: 'User Two',
			},
		},
	]

	beforeEach(async () => {
		vi.clearAllMocks()
		vi.mocked(authService.getCurrentUser).mockResolvedValue({
			user: mockUser,
		})

		const { useProject, useProjectMembers } = await import('../../utils/hooks/project')
		vi.mocked(useProject).mockReturnValue({
			data: mockProject,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as ReturnType<typeof useProject>)

		vi.mocked(useProjectMembers).mockReturnValue({
			data: mockMembers,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as ReturnType<typeof useProjectMembers>)

		window.confirm = vi.fn(() => true)
		window.alert = vi.fn()
		console.error = vi.fn()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('should display loading state initially', async () => {
		const { useProject } = await import('../../utils/hooks/project')
		vi.mocked(useProject).mockReturnValue({
			data: null,
			isLoading: true,
			isError: false,
			error: null,
		} as unknown as ReturnType<typeof useProject>)

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Chargement du projet...')).toBeInTheDocument()
		})
	})

	it('should display error state when project loading fails', async () => {
		const errorMessage = 'Project not found'
		const { useProject } = await import('../../utils/hooks/project')
		vi.mocked(useProject).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			error: new Error(errorMessage),
		} as unknown as ReturnType<typeof useProject>)

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Projet introuvable')).toBeInTheDocument()
			expect(screen.getByText(errorMessage)).toBeInTheDocument()
		})

		expect(screen.getByText('Retour aux projets')).toBeInTheDocument()
	})

	it('should display project details in overview tab', async () => {
		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument()
		})

		expect(screen.getByText('Test project description')).toBeInTheDocument()
		expect(screen.getByText('En cours')).toBeInTheDocument()
		expect(screen.getByText('Priorité Haute')).toBeInTheDocument()
		expect(screen.getByText('2 Membres')).toBeInTheDocument()
	})

	it('should switch between tabs correctly', async () => {
		const user = userEvent.setup()

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument()
		})

		const kanbanTab = screen.getByText('Kanban')
		await user.click(kanbanTab)
		expect(screen.getByTestId('kanban-board')).toBeInTheDocument()

		const backlogTab = screen.getByText('Backlog')
		await user.click(backlogTab)
		expect(screen.getByTestId('backlog')).toBeInTheDocument()

		const membersTab = screen.getByText('Membres')
		await user.click(membersTab)
		expect(screen.getByTestId('members-list')).toBeInTheDocument()

		const overviewTab = screen.getByText("Vue d'ensemble")
		await user.click(overviewTab)
		expect(screen.getByText('Description du projet')).toBeInTheDocument()
	})

	it('should open task modal for creating new task', async () => {
		const user = userEvent.setup()

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument()
		})

		await user.click(screen.getByText('Backlog'))

		const createTaskBtn = screen.getByTestId('create-task-btn')
		await user.click(createTaskBtn)

		expect(screen.getByTestId('task-modal')).toBeInTheDocument()
		expect(screen.getByText('Task: New Task')).toBeInTheDocument()
	})

	it('should open task modal for editing existing task', async () => {
		const user = userEvent.setup()

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument()
		})

		await user.click(screen.getByText('Backlog'))

		const editTaskBtn = screen.getByTestId('edit-task-btn')
		await user.click(editTaskBtn)

		expect(screen.getByTestId('task-modal')).toBeInTheDocument()
		expect(screen.getByText('Task: Test Task')).toBeInTheDocument()
	})

	it('should close task modal when close button is clicked', async () => {
		const user = userEvent.setup()

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument()
		})

		await user.click(screen.getByText('Backlog'))
		await user.click(screen.getByTestId('create-task-btn'))

		expect(screen.getByTestId('task-modal')).toBeInTheDocument()

		await user.click(screen.getByTestId('close-modal'))

		expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()
	})

	it('should handle task creation successfully', async () => {
		const user = userEvent.setup()
		vi.mocked(taskService.createTask).mockResolvedValue({
			id: 1,
			title: 'New Task',
			description: '',
			status: TaskStatus.A_FAIRE,
			priority: TaskPriority.MOYENNE,
			projectId: 1,
			createdAt: '2025-01-01T00:00:00.000Z',
			updatedAt: '2025-01-01T00:00:00.000Z',
		})

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument()
		})

		await user.click(screen.getByText('Backlog'))
		await user.click(screen.getByTestId('create-task-btn'))
		await user.click(screen.getByTestId('save-task'))

		await waitFor(() => {
			expect(taskService.createTask).toHaveBeenCalledWith(1, {
				title: 'Saved Task',
				description: undefined,
				status: TaskStatus.A_FAIRE,
				priority: undefined,
				dueDate: undefined,
				assignedToId: undefined,
			})
		})

		expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()
	})

	it('should handle task update successfully', async () => {
		const user = userEvent.setup()
		vi.mocked(taskService.updateTask).mockResolvedValue({
			id: 1,
			title: 'Updated Task',
			description: '',
			status: TaskStatus.A_FAIRE,
			priority: TaskPriority.MOYENNE,
			projectId: 1,
			createdAt: '2025-01-01T00:00:00.000Z',
			updatedAt: '2025-01-01T00:00:00.000Z',
		})

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument()
		})

		await user.click(screen.getByText('Backlog'))
		await user.click(screen.getByTestId('edit-task-btn'))
		await user.click(screen.getByTestId('save-task'))

		await waitFor(() => {
			expect(taskService.updateTask).toHaveBeenCalledWith(1, {
				title: 'Saved Task',
				description: undefined,
				status: undefined,
				priority: undefined,
				dueDate: undefined,
				assignedToId: undefined,
			})
		})

		expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()
	})

	it('should handle task deletion successfully', async () => {
		const user = userEvent.setup()
		vi.mocked(taskService.deleteTask).mockResolvedValue(undefined)

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument()
		})

		await user.click(screen.getByText('Backlog'))
		await user.click(screen.getByTestId('delete-task-btn'))

		await waitFor(() => {
			expect(window.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer cette tâche ?')
			expect(taskService.deleteTask).toHaveBeenCalledWith(1)
		})
	})

	it('should cancel task deletion when user cancels confirmation', async () => {
		const user = userEvent.setup()
		window.confirm = vi.fn(() => false)

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument()
		})

		await user.click(screen.getByText('Backlog'))
		await user.click(screen.getByTestId('delete-task-btn'))

		expect(window.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer cette tâche ?')
		expect(taskService.deleteTask).not.toHaveBeenCalled()
	})

	it('should display correct status colors and emojis', async () => {
		const projects = [
			{ ...mockProject, status: 'En cours' as const },
			{ ...mockProject, status: 'Terminé' as const },
			{ ...mockProject, status: 'En attente' as const },
			{ ...mockProject, status: undefined },
		]

		for (let i = 0; i < projects.length; i++) {
			const { useProject } = await import('../../utils/hooks/project')
			vi.mocked(useProject).mockReturnValue({
				data: projects[i],
				isLoading: false,
				isError: false,
				error: null,
			} as unknown as ReturnType<typeof useProject>)

			const { unmount } = render(
				<TestWrapper>
					<ProjectDetail />
				</TestWrapper>
			)

			await waitFor(() => {
				expect(screen.getByText('Test Project')).toBeInTheDocument()
			})

			if (projects[i].status === 'En cours') {
				expect(screen.getByText('🚀')).toBeInTheDocument()
			} else if (projects[i].status === 'Terminé') {
				expect(screen.getByText('✅')).toBeInTheDocument()
			} else if (projects[i].status === 'En attente') {
				expect(screen.getByText('⏳')).toBeInTheDocument()
			} else {
				expect(screen.getByText('📝')).toBeInTheDocument()
			}

			unmount()
		}
	})

	it('should display correct priority colors and emojis', async () => {
		const projects = [
			{ ...mockProject, priority: 'Haute' as const },
			{ ...mockProject, priority: 'Moyenne' as const },
			{ ...mockProject, priority: 'Basse' as const },
			{ ...mockProject, priority: undefined },
		]

		for (let i = 0; i < projects.length; i++) {
			const { useProject } = await import('../../utils/hooks/project')
			vi.mocked(useProject).mockReturnValue({
				data: projects[i],
				isLoading: false,
				isError: false,
				error: null,
			} as unknown as ReturnType<typeof useProject>)

			const { unmount } = render(
				<TestWrapper>
					<ProjectDetail />
				</TestWrapper>
			)

			await waitFor(() => {
				expect(screen.getByText('Test Project')).toBeInTheDocument()
			})

			if (projects[i].priority === 'Haute') {
				expect(screen.getByText('🔥')).toBeInTheDocument()
			} else if (projects[i].priority === 'Moyenne') {
				expect(screen.getByText('⚠️')).toBeInTheDocument()
			} else if (projects[i].priority === 'Basse') {
				expect(screen.getByText('🌱')).toBeInTheDocument()
			} else {
				expect(screen.getByText('📊')).toBeInTheDocument()
			}

			unmount()
		}
	})

	it('should display formatted creation and update dates', async () => {
		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument()
		})

		expect(screen.getByText('mercredi 1 janvier 2025')).toBeInTheDocument()
		expect(screen.getByText('jeudi 2 janvier 2025')).toBeInTheDocument()
	})

	it('should display member count correctly', async () => {
		const tests = [
			{ members: [], expected: '0 Membre' },
			{ members: [mockMembers[0]], expected: '1 Membre' },
			{ members: mockMembers, expected: '2 Membres' },
		]

		for (const test of tests) {
			const { useProjectMembers } = await import('../../utils/hooks/project')
			vi.mocked(useProjectMembers).mockReturnValue({
				data: test.members,
				isLoading: false,
				isError: false,
				error: null,
			} as unknown as ReturnType<typeof useProjectMembers>)

			const { unmount } = render(
				<TestWrapper>
					<ProjectDetail />
				</TestWrapper>
			)

			await waitFor(() => {
				expect(screen.getByText('Test Project')).toBeInTheDocument()
			})

			expect(screen.getByText(test.expected)).toBeInTheDocument()

			unmount()
		}
	})
})
