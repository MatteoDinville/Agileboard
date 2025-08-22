import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import ProjectForm from '../../pages/ProjectForm';
import { projectService } from '../../services/project';
import { authService } from '../../services/auth';

vi.mock('../../services/project', () => ({
	projectService: {
		createProject: vi.fn(),
		fetchProjects: vi.fn(),
		fetchProjectById: vi.fn(),
		updateProject: vi.fn(),
		deleteProject: vi.fn(),
	},
}));

vi.mock('../../services/auth', () => ({
	authService: {
		login: vi.fn(),
		getCurrentUser: vi.fn(),
		logout: vi.fn(),
		register: vi.fn(),
	},
}));

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', async () => {
	const actual = await vi.importActual('@tanstack/react-router');
	return {
		...actual,
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

describe('Project creation (project manager)', () => {
	const mockUser = {
		id: 1,
		email: 'chef@projet.com',
		name: 'Chef Projet',
	};

	const mockProject = {
		id: 1,
		title: 'Nouveau Projet',
		description: 'Description du nouveau projet',
		status: 'En attente' as const,
		priority: 'Basse' as const,
		createdAt: '2025-01-01T00:00:00.000Z',
		updatedAt: '2025-01-01T00:00:00.000Z',
		ownerId: 1,
		members: [],
	};

	const validProjectData = {
		title: 'Nouveau Projet',
		description: 'Description du nouveau projet',
		status: 'En attente' as const,
		priority: 'Basse' as const,
	}; beforeEach(() => {
		vi.mocked(authService.getCurrentUser).mockResolvedValue({
			user: mockUser,
		});

		vi.mocked(projectService.createProject).mockResolvedValue(mockProject);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should allow a project manager to create a new project', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<ProjectForm />
			</TestWrapper>
		);

		expect(screen.getByText('Créer un nouveau projet')).toBeInTheDocument();
		expect(screen.getByText('Donnez vie à votre nouvelle idée')).toBeInTheDocument();

		const titleInput = screen.getByLabelText(/titre du projet/i);
		expect(titleInput).toBeInTheDocument();

		await user.type(titleInput, validProjectData.title);
		expect(titleInput).toHaveValue(validProjectData.title);

		const descriptionInput = screen.getByLabelText(/description/i);
		expect(descriptionInput).toBeInTheDocument();

		await user.type(descriptionInput, validProjectData.description);
		expect(descriptionInput).toHaveValue(validProjectData.description);

		const submitButton = screen.getByRole('button', { name: /créer le projet/i });
		expect(submitButton).toBeInTheDocument();
		expect(submitButton).not.toBeDisabled();

		await user.click(submitButton);

		await waitFor(() => {
			expect(projectService.createProject).toHaveBeenCalledWith(validProjectData);
			expect(projectService.createProject).toHaveBeenCalledTimes(1);
		});

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects' });
		});
	});

	it('should display loading state during project creation', async () => {
		const user = userEvent.setup();

		vi.mocked(projectService.createProject).mockImplementation(
			() => new Promise(resolve =>
				setTimeout(() => resolve(mockProject), 100)
			)
		);

		render(
			<TestWrapper>
				<ProjectForm />
			</TestWrapper>
		);

		const titleInput = screen.getByLabelText(/titre du projet/i);
		const descriptionInput = screen.getByLabelText(/description/i);

		await user.type(titleInput, validProjectData.title);
		await user.type(descriptionInput, validProjectData.description);

		const submitButton = screen.getByRole('button', { name: /créer le projet/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.queryByText(/création en cours/i)).toBeInTheDocument();
		}, { timeout: 50 });

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects' });
		});
	});

	it('should validate required fields before submission', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<ProjectForm />
			</TestWrapper>
		);

		const submitButton = screen.getByRole('button', { name: /créer le projet/i });

		await user.click(submitButton);

		expect(projectService.createProject).not.toHaveBeenCalled();

		const titleInput = screen.getByLabelText(/titre du projet/i);
		expect(titleInput).toBeRequired();
	});

	it('should allow selecting status and priority', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<ProjectForm />
			</TestWrapper>
		);

		const titleInput = screen.getByLabelText(/titre du projet/i);
		const descriptionInput = screen.getByLabelText(/description/i);

		await user.type(titleInput, validProjectData.title);
		await user.type(descriptionInput, validProjectData.description);

		const statusSelect = screen.getByLabelText(/statut/i);
		await user.selectOptions(statusSelect, 'En cours');
		expect(statusSelect).toHaveValue('En cours');

		const prioritySelect = screen.getByLabelText(/priorité/i);
		await user.selectOptions(prioritySelect, 'Haute');
		expect(prioritySelect).toHaveValue('Haute');

		const submitButton = screen.getByRole('button', { name: /créer le projet/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(projectService.createProject).toHaveBeenCalledWith({
				title: validProjectData.title,
				description: validProjectData.description,
				status: 'En cours',
				priority: 'Haute',
			});
		});
	});

	it('should display error message on creation failure', async () => {
		const user = userEvent.setup();

		const errorMessage = 'Erreur lors de la création du projet';
		vi.mocked(projectService.createProject).mockRejectedValue(new Error(errorMessage));

		render(
			<TestWrapper>
				<ProjectForm />
			</TestWrapper>
		);

		const titleInput = screen.getByLabelText(/titre du projet/i);
		const descriptionInput = screen.getByLabelText(/description/i);
		const submitButton = screen.getByRole('button', { name: /créer le projet/i });

		await user.type(titleInput, validProjectData.title);
		await user.type(descriptionInput, validProjectData.description);
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(errorMessage) || screen.getByText(/erreur/i)).toBeInTheDocument();
		});

		expect(screen.getByText('Créer un nouveau projet')).toBeInTheDocument();
		expect(mockNavigate).not.toHaveBeenCalled();
	});
});

describe('Project editing (project manager)', () => {
	const mockUser = {
		id: 1,
		email: 'chef@projet.com',
		name: 'Chef Projet',
	};

	const existingProject = {
		id: 1,
		title: 'Projet Existant',
		description: 'Description du projet existant',
		status: 'En cours' as const,
		priority: 'Haute' as const,
		createdAt: '2025-01-01T00:00:00.000Z',
		updatedAt: '2025-01-01T00:00:00.000Z',
		ownerId: 1,
		members: [],
	};

	beforeEach(() => {
		vi.mocked(authService.getCurrentUser).mockResolvedValue({
			user: mockUser,
		});

		vi.mocked(projectService.fetchProjectById).mockClear();
		vi.mocked(projectService.updateProject).mockClear();
		mockNavigate.mockClear();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should load and display existing project data', async () => {
		vi.mocked(projectService.fetchProjectById).mockResolvedValue(existingProject);

		render(
			<TestWrapper>
				<ProjectForm projectId={1} />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Modifier le projet')).toBeInTheDocument();
		});

		expect(screen.getByDisplayValue('Projet Existant')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Description du projet existant')).toBeInTheDocument();
		expect(screen.getByDisplayValue('En cours')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Haute')).toBeInTheDocument();

		expect(screen.getByText('Mettre à jour')).toBeInTheDocument();
	});

	it('should allow editing an existing project', async () => {
		const user = userEvent.setup();

		vi.mocked(projectService.fetchProjectById).mockResolvedValue(existingProject);

		const updatedProject = { ...existingProject, title: 'Projet Modifié' };
		vi.mocked(projectService.updateProject).mockResolvedValue(updatedProject);

		render(
			<TestWrapper>
				<ProjectForm projectId={1} />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Modifier le projet')).toBeInTheDocument();
		});

		const titleInput = screen.getByLabelText(/titre du projet/i);
		await user.clear(titleInput);
		await user.type(titleInput, 'Projet Modifié');

		const submitButton = screen.getByRole('button', { name: /mettre à jour/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(projectService.updateProject).toHaveBeenCalledWith(1, {
				title: 'Projet Modifié',
				description: 'Description du projet existant',
				status: 'En cours',
				priority: 'Haute',
			});
		});

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects/1' });
		});
	});

	it('should display loading state during project update', async () => {
		const user = userEvent.setup();

		vi.mocked(projectService.fetchProjectById).mockResolvedValue(existingProject);

		vi.mocked(projectService.updateProject).mockImplementation(
			() => new Promise(resolve =>
				setTimeout(() => resolve(existingProject), 100)
			)
		);

		render(
			<TestWrapper>
				<ProjectForm projectId={1} />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Modifier le projet')).toBeInTheDocument();
		});

		const titleInput = screen.getByLabelText(/titre du projet/i);
		await user.clear(titleInput);
		await user.type(titleInput, 'Projet Modifié');

		const submitButton = screen.getByRole('button', { name: /mettre à jour/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.queryByText(/mise à jour en cours/i)).toBeInTheDocument();
		}, { timeout: 50 });

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects/1' });
		});
	});

	it('should display error if project loading fails', async () => {
		const errorMessage = 'Projet non trouvé';

		vi.mocked(projectService.fetchProjectById).mockRejectedValue(
			new Error(errorMessage)
		);

		render(
			<TestWrapper>
				<ProjectForm projectId={1} />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
			expect(screen.getByText(errorMessage) || screen.getByText(/une erreur est survenue/i)).toBeInTheDocument();
		});

		const backButton = screen.getByRole('button', { name: /retour aux projets/i });
		expect(backButton).toBeInTheDocument();
	});

	it('should navigate to projects list from loading error', async () => {
		const user = userEvent.setup();

		vi.mocked(projectService.fetchProjectById).mockRejectedValue(
			new Error('Projet non trouvé')
		);

		render(
			<TestWrapper>
				<ProjectForm projectId={1} />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
		});

		const backButton = screen.getByRole('button', { name: /retour aux projets/i });
		await user.click(backButton);

		expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects' });
	});

	it('should display error message on update failure', async () => {
		const user = userEvent.setup();
		const errorMessage = 'Erreur lors de la mise à jour du projet';

		vi.mocked(projectService.fetchProjectById).mockResolvedValue(existingProject);

		vi.mocked(projectService.updateProject).mockRejectedValue(
			new Error(errorMessage)
		);

		render(
			<TestWrapper>
				<ProjectForm projectId={1} />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Modifier le projet')).toBeInTheDocument();
		});

		const titleInput = screen.getByLabelText(/titre du projet/i);
		await user.clear(titleInput);
		await user.type(titleInput, 'Projet Modifié');

		const submitButton = screen.getByRole('button', { name: /mettre à jour/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(errorMessage) || screen.getByText(/erreur lors de la mise à jour/i)).toBeInTheDocument();
		});

		expect(screen.getByText('Modifier le projet')).toBeInTheDocument();
		expect(mockNavigate).not.toHaveBeenCalled();
	});
});

describe('Navigation and interaction tests', () => {
	const mockUser = {
		id: 1,
		email: 'chef@projet.com',
		name: 'Chef Projet',
	};

	beforeEach(() => {
		vi.mocked(authService.getCurrentUser).mockResolvedValue({
			user: mockUser,
		});

		mockNavigate.mockClear();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should navigate to projects list when clicking Cancel', async () => {
		const user = userEvent.setup();

		render(
			<TestWrapper>
				<ProjectForm />
			</TestWrapper>
		);

		const cancelButton = screen.getByRole('button', { name: /annuler/i });
		await user.click(cancelButton);

		expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects' });
	});
});

describe('Fallback and default values tests', () => {
	const mockUser = {
		id: 1,
		email: 'chef@projet.com',
		name: 'Chef Projet',
	};

	beforeEach(() => {
		vi.mocked(authService.getCurrentUser).mockResolvedValue({
			user: mockUser,
		});

		vi.mocked(projectService.fetchProjectById).mockClear();
		vi.mocked(projectService.createProject).mockClear();
		vi.mocked(projectService.updateProject).mockClear();
		mockNavigate.mockClear();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should use default values for missing fields in edit mode', async () => {
		const mockFetchProject = vi.fn().mockResolvedValue({
			id: 1,
			title: 'Projet Incomplet',
			description: undefined,
			status: undefined,
			priority: undefined,
			createdAt: '2025-01-01T00:00:00.000Z',
			updatedAt: '2025-01-01T00:00:00.000Z',
			ownerId: 1,
			members: [],
		});

		vi.mocked(projectService.fetchProjectById).mockImplementation(mockFetchProject);

		render(
			<TestWrapper>
				<ProjectForm projectId={1} />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Modifier le projet')).toBeInTheDocument();
		});

		expect(screen.getByDisplayValue('Projet Incomplet')).toBeInTheDocument();
		expect(screen.getByDisplayValue('')).toBeInTheDocument();
		expect(screen.getByDisplayValue('En attente')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Basse')).toBeInTheDocument();
	});

	it('should display default error message if errorProject.message is missing', async () => {
		const errorWithoutMessage = {
			message: undefined,
			name: 'Error'
		};

		vi.mocked(projectService.fetchProjectById).mockRejectedValue(errorWithoutMessage);

		render(
			<TestWrapper>
				<ProjectForm projectId={1} />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
		});
	});

	it('should display default error message for creation', async () => {
		const user = userEvent.setup();

		const errorWithoutMessage = {
			message: undefined,
			name: 'Error'
		};

		vi.mocked(projectService.createProject).mockRejectedValue(errorWithoutMessage);

		render(
			<TestWrapper>
				<ProjectForm />
			</TestWrapper>
		);

		const titleInput = screen.getByLabelText(/titre du projet/i);
		await user.type(titleInput, 'Test Project');

		const submitButton = screen.getByRole('button', { name: /créer le projet/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText('Erreur lors de la création')).toBeInTheDocument();
		});
	});

	it('should display default error message for update', async () => {
		const user = userEvent.setup();

		const existingProject = {
			id: 1,
			title: 'Projet Existant',
			description: 'Description',
			status: 'En cours' as const,
			priority: 'Haute' as const,
			createdAt: '2025-01-01T00:00:00.000Z',
			updatedAt: '2025-01-01T00:00:00.000Z',
			ownerId: 1,
			members: [],
		};

		vi.mocked(projectService.fetchProjectById).mockResolvedValue(existingProject);

		const errorWithoutMessage = {
			message: undefined,
			name: 'Error'
		};

		vi.mocked(projectService.updateProject).mockRejectedValue(errorWithoutMessage);

		render(
			<TestWrapper>
				<ProjectForm projectId={1} />
			</TestWrapper>
		);

		await waitFor(() => {
			expect(screen.getByText('Modifier le projet')).toBeInTheDocument();
		});

		const titleInput = screen.getByLabelText(/titre du projet/i);
		await user.clear(titleInput);
		await user.type(titleInput, 'Projet Modifié');

		const submitButton = screen.getByRole('button', { name: /mettre à jour/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText('Erreur lors de la mise à jour')).toBeInTheDocument();
		});
	});
});
