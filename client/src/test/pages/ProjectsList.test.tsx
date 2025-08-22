import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import { ThemeProvider } from '../../contexts/ThemeContext'
import ProjectsList from '../../pages/ProjectsList'
import { authService } from '../../services/auth'

vi.mock('@tanstack/react-router', () => ({
	Link: ({ children, ...props }: { children: React.ReactNode;[key: string]: unknown }) => <a {...props}>{children}</a>,
	useNavigate: vi.fn(() => vi.fn()),
	useParams: vi.fn(() => ({})),
	useRouterState: vi.fn(() => ({ location: { pathname: '/projects' } })),
	createRouter: vi.fn(),
	RouterProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../../utils/hooks/project', () => ({
	useProjects: vi.fn(),
	useDeleteProject: vi.fn(),
}))

vi.mock('../../services/auth', () => ({
	authService: {
		getCurrentUser: vi.fn(),
	},
}))

vi.mock('lucide-react', () => ({
	Users: () => <div data-testid="users" />,
	Search: () => <div data-testid="search" />,
	List: () => <div data-testid="list" />,
	Grid3x3: () => <div data-testid="grid3x3" />,
	Grid3X3: () => <div data-testid="grid3x3" />,
	Plus: () => <div data-testid="plus" />,
	Eye: () => <div data-testid="eye" />,
	Edit: () => <div data-testid="edit" />,
	Edit3: () => <div data-testid="edit3" />,
	Trash2: () => <div data-testid="trash2" />,
	AlertCircle: () => <div data-testid="alert-circle" />,
	FolderOpen: () => <div data-testid="folder-open" />,
	Calendar: () => <div data-testid="calendar" />,
	Clock: () => <div data-testid="clock" />,
	UserPlus: () => <div data-testid="user-plus" />,
	ArrowLeft: () => <div data-testid="arrow-left" />,
	ChevronDown: () => <div data-testid="chevron-down" />,
	Crown: () => <div data-testid="crown" />,
	UserCheck: () => <div data-testid="user-check" />,
	Moon: () => <div data-testid="moon" />,
	Sun: () => <div data-testid="sun" />,
}))

const mockProjects = [
	{
		id: 1,
		title: 'Project Alpha',
		description: 'First project description',
		status: 'En cours',
		priority: 'Haute',
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-02T00:00:00Z',
		ownerId: 1,
		members: [
			{ id: 1, userId: 1, projectId: 1, addedAt: '2024-01-01T00:00:00Z', user: { id: 1, name: 'User 1', email: 'user1@example.com' } },
			{ id: 2, userId: 2, projectId: 1, addedAt: '2024-01-02T00:00:00Z', user: { id: 2, name: 'User 2', email: 'user2@example.com' } },
		],
	},
	{
		id: 2,
		title: 'Project Beta',
		description: 'Second project description',
		status: 'Terminé',
		priority: 'Basse',
		createdAt: '2024-01-03T00:00:00Z',
		updatedAt: '2024-01-04T00:00:00Z',
		ownerId: 2,
		members: [
			{ id: 3, userId: 3, projectId: 2, addedAt: '2024-01-03T00:00:00Z', user: { id: 3, name: 'User 3', email: 'user3@example.com' } },
		],
	},
	{
		id: 3,
		title: 'Project Gamma',
		description: 'Third project description',
		status: 'En attente',
		priority: 'Moyenne',
		createdAt: '2024-01-05T00:00:00Z',
		updatedAt: '2024-01-06T00:00:00Z',
		ownerId: 1,
		members: [
			{ id: 4, userId: 4, projectId: 3, addedAt: '2024-01-05T00:00:00Z', user: { id: 4, name: 'User 4', email: 'user4@example.com' } },
		],
	},
]

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
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

describe('ProjectsList', () => {
	const mockUser = {
		id: 1,
		email: 'test@example.com',
		name: 'Test User',
	}

	beforeEach(async () => {
		vi.clearAllMocks()
		vi.mocked(authService.getCurrentUser).mockResolvedValue({
			user: mockUser,
		})
		global.confirm = vi.fn(() => true)

		const { useProjects, useDeleteProject } = await import('../../utils/hooks/project')
		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as ReturnType<typeof useProjects>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as ReturnType<typeof useDeleteProject>)
	})

	it('should render projects list', () => {
		render(
			<TestWrapper>
				<ProjectsList />
			</TestWrapper>
		)

		expect(screen.getByText('Projets')).toBeInTheDocument()
		expect(screen.getByText('Project Alpha')).toBeInTheDocument()
		expect(screen.getByText('Project Beta')).toBeInTheDocument()
		expect(screen.getByText('Project Gamma')).toBeInTheDocument()
		const totalProjectsBadges = screen.getAllByText('3')
		expect(totalProjectsBadges.length).toBeGreaterThan(0)
	})

	it('should render loading state', async () => {
		const { useProjects } = await import('../../utils/hooks/project')
		vi.mocked(useProjects).mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
			error: null,
		} as unknown as ReturnType<typeof useProjects>)

		render(
			<TestWrapper>
				<ProjectsList />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Chargement des projets...')).toBeInTheDocument()
		})
	})

	it('should render error state', async () => {
		const { useProjects } = await import('../../utils/hooks/project')
		vi.mocked(useProjects).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			error: { message: 'Failed to load projects' } as Error,
		} as unknown as ReturnType<typeof useProjects>)

		render(
			<TestWrapper>
				<ProjectsList />
			</TestWrapper>
		)

		expect(screen.getByTestId('alert-circle')).toBeInTheDocument()
		expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
		expect(screen.getByText('Erreur : Failed to load projects')).toBeInTheDocument()
	})

	it('should filter projects by search term', async () => {
		render(
			<TestWrapper>
				<ProjectsList />
			</TestWrapper>
		)

		const searchInput = screen.getByPlaceholderText('Rechercher un projet...')
		fireEvent.change(searchInput, { target: { value: 'Alpha' } })

		expect(screen.getByText('Project Alpha')).toBeInTheDocument()
		expect(screen.queryByText('Project Beta')).not.toBeInTheDocument()
		expect(screen.queryByText('Project Gamma')).not.toBeInTheDocument()
		expect(screen.getByText('1')).toBeInTheDocument()
	})

	it('should switch between list and grid view modes', async () => {
		render(
			<TestWrapper>
				<ProjectsList />
			</TestWrapper>
		)

		const listButton = screen.getByTestId('list').closest('button')
		const gridButton = screen.getByTestId('grid3x3').closest('button')

		expect(listButton).toHaveClass('bg-white')
		expect(gridButton).not.toHaveClass('bg-white')

		fireEvent.click(gridButton!)

		expect(gridButton).toHaveClass('bg-white')
		expect(listButton).not.toHaveClass('bg-white')
	})

	it('should handle project deletion', async () => {
		const { useDeleteProject } = await import('../../utils/hooks/project')
		const mockMutate = vi.fn()
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: mockMutate,
		} as unknown as ReturnType<typeof useDeleteProject>)

		render(
			<TestWrapper>
				<ProjectsList />
			</TestWrapper>
		)

		await waitFor(() => {
			expect(screen.getByText('Project Alpha')).toBeInTheDocument()
		})

		expect(screen.getByText('Project Alpha')).toBeInTheDocument()
		expect(screen.getByText('Project Beta')).toBeInTheDocument()
		expect(screen.getByText('Project Gamma')).toBeInTheDocument()
	})

	it('should show empty state when no projects', async () => {
		const { useProjects } = await import('../../utils/hooks/project')
		vi.mocked(useProjects).mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as ReturnType<typeof useProjects>)

		render(
			<TestWrapper>
				<ProjectsList />
			</TestWrapper>
		)

		expect(screen.getByText('Aucun projet pour le moment')).toBeInTheDocument()
		expect(screen.getByText('Commencez par créer votre premier projet')).toBeInTheDocument()
		expect(screen.getByText('Créer mon premier projet')).toBeInTheDocument()
	})

	it('should display owned and member projects sections correctly', () => {
		render(
			<TestWrapper>
				<ProjectsList />
			</TestWrapper>
		)

		expect(screen.getByText('Project Alpha')).toBeInTheDocument()
		expect(screen.getByText('Project Beta')).toBeInTheDocument()
		expect(screen.getByText('Project Gamma')).toBeInTheDocument()

		const totalProjectsBadges = screen.getAllByText('3')
		expect(totalProjectsBadges.length).toBeGreaterThan(0)
	})

	it('should filter projects by status', () => {
		render(
			<TestWrapper>
				<ProjectsList />
			</TestWrapper>
		)

		const statusSelect = screen.getByRole('combobox')
		fireEvent.change(statusSelect, { target: { value: 'En cours' } })

		expect(screen.getByText('Project Alpha')).toBeInTheDocument()
		expect(screen.queryByText('Project Beta')).not.toBeInTheDocument()
		expect(screen.queryByText('Project Gamma')).not.toBeInTheDocument()
	})
})
