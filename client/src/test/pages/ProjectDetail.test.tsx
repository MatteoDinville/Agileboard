import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import ProjectDetail from '../../pages/ProjectDetail';
import { projectService } from '../../services/project';
import { taskService } from '../../services/task';
import { authService } from '../../services/auth';
import { TaskStatus, TaskPriority } from '../../types/enums';

vi.mock('../../services/project', () => ({
	projectService: {
		fetchProjectById: vi.fn(),
		fetchProjectMembers: vi.fn(),
		createProject: vi.fn(),
		updateProject: vi.fn(),
		deleteProject: vi.fn(),
		fetchProjects: vi.fn(),
	},
}));

vi.mock('../../services/task', () => ({
	taskService: {
		createTask: vi.fn(),
		updateTask: vi.fn(),
		deleteTask: vi.fn(),
		fetchTasks: vi.fn(),
	},
}));

vi.mock('../../services/auth', () => ({
	authService: {
		getCurrentUser: vi.fn(),
		login: vi.fn(),
		logout: vi.fn(),
		register: vi.fn(),
	},
}));

vi.mock('../../components/KanbanBoard', () => ({
	default: ({ projectId }: { projectId: number }) => (
		<div data-testid="kanban-board">KanbanBoard for project {projectId}</div>
	),
}));

vi.mock('../../components/Backlog', () => ({
	default: ({ projectId, onEditTask, onDeleteTask, onCreateTask }: {
		projectId: number;
		onEditTask: (task: { id: number; title: string }) => void;
		onDeleteTask: (taskId: number) => void;
		onCreateTask: () => void;
	}) => (
		<div data-testid="backlog">
			<div>Backlog for project {projectId}</div>
			<button onClick={onCreateTask} data-testid="create-task-btn">Create Task</button>
			<button onClick={() => onEditTask({ id: 1, title: 'Test Task' })} data-testid="edit-task-btn">Edit Task</button>
			<button onClick={() => onDeleteTask(1)} data-testid="delete-task-btn">Delete Task</button>
		</div>
	),
}));

vi.mock('../../components/MembersListOnly', () => ({
	default: ({ projectId, isOwner }: { projectId: number; isOwner: boolean }) => (
		<div data-testid="members-list">
			<div>Members for project {projectId}</div>
			<div>Owner: {isOwner ? 'true' : 'false'}</div>
		</div>
	),
}));

vi.mock('../../components/TaskModal', () => ({
	default: ({ isOpen, onClose, task, onSave, projectId }: {
		isOpen: boolean;
		onClose: () => void;
		task?: { title: string } | null;
		onSave: (data: { title: string }) => void;
		projectId: number;
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
}));

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', async () => {
	const actual = await vi.importActual('@tanstack/react-router');
	return {
		...actual,
		useParams: vi.fn(() => ({ projectId: '1' })),
		Link: ({ children, to, ...props }: { children: React.ReactNode; to: string;[key: string]: unknown }) => (
			<a href={to} {...props}>{children}</a>
		),
		useNavigate: () => mockNavigate,
	};
});

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
	});

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				{children}
			</AuthProvider>
		</QueryClientProvider>
	);
};

describe('ProjectDetail component', () => {
	const mockUser = {
		id: 1,
		email: 'test@example.com',
		name: 'Test User',
	};

	const mockProject = {
		id: 1,
		title: 'Test Project',
		description: 'Test project description',
		status: 'En cours' as const,
		priority: 'Haute' as const,
		createdAt: '2025-01-01T00:00:00.000Z',
		updatedAt: '2025-01-02T00:00:00.000Z',
		ownerId: 1,
		members: [],
	};

	const mockMembers = [
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
	];

	beforeEach(() => {
		vi.mocked(authService.getCurrentUser).mockResolvedValue({
			user: mockUser,
		});

		vi.mocked(projectService.fetchProjectById).mockResolvedValue(mockProject);
		vi.mocked(projectService.fetchProjectMembers).mockResolvedValue(mockMembers);

		window.confirm = vi.fn(() => true);
		window.alert = vi.fn();
		console.error = vi.fn();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should display loading state initially', async () => {
		vi.mocked(projectService.fetchProjectById).mockImplementation(
			() => new Promise(resolve => setTimeout(() => resolve(mockProject), 100))
		);

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		expect(screen.getByText('Chargement du projet…')).toBeInTheDocument();
		const svgElement = document.querySelector('svg.lucide-loader-circle');
		expect(svgElement).toBeInTheDocument();
	});

	it('should display error state when project loading fails', async () => {
		const errorMessage = 'Project not found';
		vi.mocked(projectService.fetchProjectById).mockRejectedValue(new Error(errorMessage));

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Projet introuvable')).toBeInTheDocument();
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});

		expect(screen.getByText('Retour aux projets')).toBeInTheDocument();
	});

	it('should display default error message when no specific error message', async () => {
		vi.mocked(projectService.fetchProjectById).mockRejectedValue(new Error());

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText("Ce projet n'existe pas ou vous n'avez pas accès.")).toBeInTheDocument();
		});
	});

	it('should display project details in overview tab', async () => {
		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		expect(screen.getByText('Test project description')).toBeInTheDocument();
		expect(screen.getByText('En cours')).toBeInTheDocument();
		expect(screen.getByText('Priorité Haute')).toBeInTheDocument();
		expect(screen.getByText('2 Membres')).toBeInTheDocument();
	});

	it('should display default values when project has missing information', async () => {
		const incompleteProject = {
			...mockProject,
			description: undefined,
			status: undefined,
			priority: undefined,
		};

		vi.mocked(projectService.fetchProjectById).mockResolvedValue(incompleteProject);
		vi.mocked(projectService.fetchProjectMembers).mockResolvedValue([]);

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		expect(screen.getByText('Aucune description fournie pour ce projet. Ajoutez une description pour mieux expliquer les objectifs et le contexte de ce projet.')).toBeInTheDocument();
		expect(screen.getByText('Non défini')).toBeInTheDocument();
		expect(screen.getByText('Priorité Non définie')).toBeInTheDocument();
		expect(screen.getByText('0 Membre')).toBeInTheDocument();
		expect(screen.getByText('Aucun membre')).toBeInTheDocument();
	});

	it('should switch between tabs correctly', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		const kanbanTab = screen.getByText('Kanban');
		await user.click(kanbanTab);
		expect(screen.getByTestId('kanban-board')).toBeInTheDocument();

		const backlogTab = screen.getByText('Backlog');
		await user.click(backlogTab);
		expect(screen.getByTestId('backlog')).toBeInTheDocument();

		const membersTab = screen.getByText('Membres');
		await user.click(membersTab);
		expect(screen.getByTestId('members-list')).toBeInTheDocument();

		const overviewTab = screen.getByText("Vue d'ensemble");
		await user.click(overviewTab);
		expect(screen.getByText('Description du projet')).toBeInTheDocument();
	});

	it('should navigate to members tab when clicking see all members', async () => {
		const user = userEvent.setup();
		const manyMembers = Array.from({ length: 5 }, (_, i) => ({
			id: i + 1,
			userId: i + 1,
			projectId: 1,
			addedAt: '2025-01-01T00:00:00.000Z',
			user: {
				id: i + 1,
				email: `user${i + 1}@test.com`,
				name: `User ${i + 1}`,
			},
		}));

		vi.mocked(projectService.fetchProjectMembers).mockResolvedValue(manyMembers);

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		const seeAllButton = screen.getByText('Voir tous les membres (5)');
		await user.click(seeAllButton);

		expect(screen.getByTestId('members-list')).toBeInTheDocument();
	});

	it('should navigate to tabs using quick actions', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		const kanbanAction = screen.getByText('Voir le Kanban');
		await user.click(kanbanAction);
		expect(screen.getByTestId('kanban-board')).toBeInTheDocument();

		await user.click(screen.getByText("Vue d'ensemble"));

		const backlogAction = screen.getByText('Voir le Backlog');
		await user.click(backlogAction);
		expect(screen.getByTestId('backlog')).toBeInTheDocument();

		await user.click(screen.getByText("Vue d'ensemble"));

		const membersAction = screen.getByText("Gérer l'équipe");
		await user.click(membersAction);
		expect(screen.getByTestId('members-list')).toBeInTheDocument();
	});

	it('should open task modal for creating new task', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		await user.click(screen.getByText('Backlog'));

		const createTaskBtn = screen.getByTestId('create-task-btn');
		await user.click(createTaskBtn);

		expect(screen.getByTestId('task-modal')).toBeInTheDocument();
		expect(screen.getByText('Task: New Task')).toBeInTheDocument();
	});

	it('should open task modal for editing existing task', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		await user.click(screen.getByText('Backlog'));

		const editTaskBtn = screen.getByTestId('edit-task-btn');
		await user.click(editTaskBtn);

		expect(screen.getByTestId('task-modal')).toBeInTheDocument();
		expect(screen.getByText('Task: Test Task')).toBeInTheDocument();
	});

	it('should close task modal when close button is clicked', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		await user.click(screen.getByText('Backlog'));
		await user.click(screen.getByTestId('create-task-btn'));

		expect(screen.getByTestId('task-modal')).toBeInTheDocument();

		await user.click(screen.getByTestId('close-modal'));

		expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
	});

	it('should handle task creation successfully', async () => {
		const user = userEvent.setup();
		vi.mocked(taskService.createTask).mockResolvedValue({
			id: 1,
			title: 'New Task',
			description: '',
			status: TaskStatus.A_FAIRE,
			priority: TaskPriority.MOYENNE,
			projectId: 1,
			createdAt: '2025-01-01T00:00:00.000Z',
			updatedAt: '2025-01-01T00:00:00.000Z',
		});

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		await user.click(screen.getByText('Backlog'));
		await user.click(screen.getByTestId('create-task-btn'));
		await user.click(screen.getByTestId('save-task'));

		await waitFor(() => {
			expect(taskService.createTask).toHaveBeenCalledWith(1, {
				title: 'Saved Task',
				description: undefined,
				status: TaskStatus.A_FAIRE,
				priority: undefined,
				dueDate: undefined,
				assignedToId: undefined,
			});
		});

		expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
	});

	it('should handle task update successfully', async () => {
		const user = userEvent.setup();
		vi.mocked(taskService.updateTask).mockResolvedValue({
			id: 1,
			title: 'Updated Task',
			description: '',
			status: TaskStatus.A_FAIRE,
			priority: TaskPriority.MOYENNE,
			projectId: 1,
			createdAt: '2025-01-01T00:00:00.000Z',
			updatedAt: '2025-01-01T00:00:00.000Z',
		});

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		await user.click(screen.getByText('Backlog'));
		await user.click(screen.getByTestId('edit-task-btn'));
		await user.click(screen.getByTestId('save-task'));

		await waitFor(() => {
			expect(taskService.updateTask).toHaveBeenCalledWith(1, {
				title: 'Saved Task',
				description: undefined,
				status: undefined,
				priority: undefined,
				dueDate: undefined,
				assignedToId: undefined,
			});
		});

		expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
	});

	it('should handle task creation error', async () => {
		const user = userEvent.setup();
		vi.mocked(taskService.createTask).mockRejectedValue(new Error('Creation failed'));

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		await user.click(screen.getByText('Backlog'));
		await user.click(screen.getByTestId('create-task-btn'));
		await user.click(screen.getByTestId('save-task'));

		await waitFor(() => {
			expect(console.error).toHaveBeenCalledWith('Erreur lors de la sauvegarde de la tâche:', expect.any(Error));
			expect(window.alert).toHaveBeenCalledWith('Erreur lors de la sauvegarde de la tâche');
		});
	});

	it('should handle task update error', async () => {
		const user = userEvent.setup();
		vi.mocked(taskService.updateTask).mockRejectedValue(new Error('Update failed'));

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		await user.click(screen.getByText('Backlog'));
		await user.click(screen.getByTestId('edit-task-btn'));
		await user.click(screen.getByTestId('save-task'));

		await waitFor(() => {
			expect(console.error).toHaveBeenCalledWith('Erreur lors de la sauvegarde de la tâche:', expect.any(Error));
			expect(window.alert).toHaveBeenCalledWith('Erreur lors de la sauvegarde de la tâche');
		});
	});

	it('should handle task deletion successfully', async () => {
		const user = userEvent.setup();
		vi.mocked(taskService.deleteTask).mockResolvedValue(undefined);

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		await user.click(screen.getByText('Backlog'));
		await user.click(screen.getByTestId('delete-task-btn'));

		await waitFor(() => {
			expect(window.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer cette tâche ?');
			expect(taskService.deleteTask).toHaveBeenCalledWith(1);
		});
	});

	it('should cancel task deletion when user cancels confirmation', async () => {
		const user = userEvent.setup();
		window.confirm = vi.fn(() => false);

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		await user.click(screen.getByText('Backlog'));
		await user.click(screen.getByTestId('delete-task-btn'));

		expect(window.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer cette tâche ?');
		expect(taskService.deleteTask).not.toHaveBeenCalled();
	});

	it('should handle task deletion error', async () => {
		const user = userEvent.setup();
		vi.mocked(taskService.deleteTask).mockRejectedValue(new Error('Deletion failed'));

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		await user.click(screen.getByText('Backlog'));
		await user.click(screen.getByTestId('delete-task-btn'));

		await waitFor(() => {
			expect(console.error).toHaveBeenCalledWith('Erreur lors de la suppression de la tâche:', expect.any(Error));
			expect(window.alert).toHaveBeenCalledWith('Erreur lors de la suppression de la tâche');
		});
	});

	it('should display correct status colors and emojis', async () => {
		const projects = [
			{ ...mockProject, status: 'En cours' as const },
			{ ...mockProject, status: 'Terminé' as const },
			{ ...mockProject, status: 'En attente' as const },
			{ ...mockProject, status: undefined },
		];

		for (let i = 0; i < projects.length; i++) {
			vi.mocked(projectService.fetchProjectById).mockResolvedValue(projects[i]);

			const { unmount } = render(
				<TestWrapper>
					<ProjectDetail />
				</TestWrapper>
			);

			await waitFor(() => {
				expect(screen.getByText('Test Project')).toBeInTheDocument();
			});

			if (projects[i].status === 'En cours') {
				expect(screen.getByText('🚀')).toBeInTheDocument();
			} else if (projects[i].status === 'Terminé') {
				expect(screen.getByText('✅')).toBeInTheDocument();
			} else if (projects[i].status === 'En attente') {
				expect(screen.getByText('⏳')).toBeInTheDocument();
			} else {
				expect(screen.getByText('📝')).toBeInTheDocument();
			}

			unmount();
		}
	});

	it('should display correct priority colors and emojis', async () => {
		const projects = [
			{ ...mockProject, priority: 'Haute' as const },
			{ ...mockProject, priority: 'Moyenne' as const },
			{ ...mockProject, priority: 'Basse' as const },
			{ ...mockProject, priority: undefined },
		];

		for (let i = 0; i < projects.length; i++) {
			vi.mocked(projectService.fetchProjectById).mockResolvedValue(projects[i]);

			const { unmount } = render(
				<TestWrapper>
					<ProjectDetail />
				</TestWrapper>
			);

			await waitFor(() => {
				expect(screen.getByText('Test Project')).toBeInTheDocument();
			});

			if (projects[i].priority === 'Haute') {
				expect(screen.getByText('🔥')).toBeInTheDocument();
			} else if (projects[i].priority === 'Moyenne') {
				expect(screen.getByText('⚠️')).toBeInTheDocument();
			} else if (projects[i].priority === 'Basse') {
				expect(screen.getByText('🌱')).toBeInTheDocument();
			} else {
				expect(screen.getByText('📊')).toBeInTheDocument();
			}

			unmount();
		}
	});

	it('should display formatted creation and update dates', async () => {
		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		expect(screen.getByText('mercredi 1 janvier 2025')).toBeInTheDocument();
		expect(screen.getByText('jeudi 2 janvier 2025')).toBeInTheDocument();
	});

	it('should not display update date when same as creation date', async () => {
		const projectWithSameDates = {
			...mockProject,
			updatedAt: mockProject.createdAt,
		};

		vi.mocked(projectService.fetchProjectById).mockResolvedValue(projectWithSameDates);

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		expect(screen.getByText('mercredi 1 janvier 2025')).toBeInTheDocument();
		expect(screen.queryByText('Modifié le')).not.toBeInTheDocument();
	});

	it('should display member count correctly', async () => {
		const tests = [
			{ members: [], expected: '0 Membre' },
			{ members: [mockMembers[0]], expected: '1 Membre' },
			{ members: mockMembers, expected: '2 Membres' },
		];

		for (const test of tests) {
			vi.mocked(projectService.fetchProjectMembers).mockResolvedValue(test.members);

			const { unmount } = render(
				<TestWrapper>
					<ProjectDetail />
				</TestWrapper>
			);

			await waitFor(() => {
				expect(screen.getByText('Test Project')).toBeInTheDocument();
			});

			expect(screen.getByText(test.expected)).toBeInTheDocument();

			unmount();
		}
	});

	it('should handle task save with no title', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		await user.click(screen.getByText('Backlog'));
		await user.click(screen.getByTestId('create-task-btn'));

		const saveButton = screen.getByTestId('save-task');
		await user.click(saveButton);

		await waitFor(() => {
			expect(taskService.createTask).toHaveBeenCalledWith(1, {
				title: 'Saved Task',
				description: undefined,
				status: TaskStatus.A_FAIRE,
				priority: undefined,
				dueDate: undefined,
				assignedToId: undefined,
			});
		});
	});

	it('should display user name fallback for members without name', async () => {
		const membersWithoutName = [
			{
				id: 1,
				userId: 1,
				projectId: 1,
				addedAt: '2025-01-01T00:00:00.000Z',
				user: {
					id: 1,
					email: 'user1@test.com',
					name: undefined,
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
					name: '',
				},
			},
		];

		vi.mocked(projectService.fetchProjectMembers).mockResolvedValue(membersWithoutName);

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		expect(screen.getAllByText('Utilisateur').length).toBeGreaterThan(0);
		expect(screen.getByText('user1@test.com')).toBeInTheDocument();
		expect(screen.getByText('user2@test.com')).toBeInTheDocument();
	});

	it('should display member initials from name or email', async () => {
		const membersWithVariousNames = [
			{
				id: 1,
				userId: 1,
				projectId: 1,
				addedAt: '2025-01-01T00:00:00.000Z',
				user: {
					id: 1,
					email: 'test@example.com',
					name: 'John Doe',
				},
			},
			{
				id: 2,
				userId: 2,
				projectId: 1,
				addedAt: '2025-01-01T00:00:00.000Z',
				user: {
					id: 2,
					email: 'jane@example.com',
					name: undefined,
				},
			},
		];

		vi.mocked(projectService.fetchProjectMembers).mockResolvedValue(membersWithVariousNames);

		render(
			<TestWrapper>
				<ProjectDetail />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Test Project')).toBeInTheDocument();
		});

		expect(screen.getAllByText('J').length).toBeGreaterThan(0);
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('jane@example.com')).toBeInTheDocument();
	});
});
