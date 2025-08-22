import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from '../../pages/Dashboard'
import { AuthContext } from '../../contexts/AuthContext'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import type { Mock } from 'vitest'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
	Calendar: () => <div>Calendar</div>,
	FolderKanban: () => <div>FolderKanban</div>,
	Plus: () => <div>Plus</div>,
	Users: () => <div>Users</div>,
	Activity: () => <div>Activity</div>,
	Clock: () => <div>Clock</div>,
	Zap: () => <div>Zap</div>,
	ChevronRight: () => <div>ChevronRight</div>,
	TrendingUp: () => <div>TrendingUp</div>,
	CheckCircle: () => <div>CheckCircle</div>,
	AlertCircle: () => <div>AlertCircle</div>,
	XCircle: () => <div>XCircle</div>,
	User: () => <div>User</div>,
	LogOut: () => <div>LogOut</div>,
	Home: () => <div>Home</div>,
	Settings: () => <div>Settings</div>,
	AlertTriangle: () => <div>AlertTriangle</div>,
	Target: () => <div>Target</div>,
	CheckCircle2: () => <div>CheckCircle2</div>,
	BarChart3: () => <div>BarChart3</div>,
	Menu: () => <div>Menu</div>,
}));

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
	useNavigate: () => mockNavigate,
	Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
		`<a href="${to}">${children}</a>`,
}))

vi.mock('../../utils/hooks/project', () => ({
	useProjects: vi.fn(() => ({
		data: [
			{ id: 1, title: 'Project 1', description: 'Description 1' },
			{ id: 2, title: 'Project 2', description: 'Description 2' }
		],
		isLoading: false,
		error: null
	}))
}))

vi.mock('../../utils/hooks/task', () => ({
	useTaskStatistics: vi.fn(() => ({
		completedTasks: 48,
		pendingTasks: 12,
		inProgressTasks: 8,
		urgentTasks: 3,
		overdueTasks: 1,
		tasksThisMonth: 15,
		totalTasks: 68,
		completionRate: 71
	})),
	useProjectStatistics: vi.fn(() => ({
		activeProjects: 2,
		totalProjects: 7,
		pendingProjects: 5,
		completedProjects: 12
	})),
	useAllUserTasks: vi.fn(() => ({
		data: [],
		isLoading: false,
		error: null
	}))
}))

vi.mock('../../components/UserInvitationsNotifications', () => ({
	default: () => <div>UserInvitationsNotifications<span>3</span></div>
}))

vi.mock('../../components/ThemeToggle', () => ({
	default: () => <div>ThemeToggle</div>
}))

vi.mock('../../components/Loading', () => ({
	PageLoader: ({ label }: { label: string }) => <div>{label}</div>
}))

vi.mock('react-hot-toast', () => ({
	default: {
		success: vi.fn()
	}
}))

interface User {
	id: number;
	email: string;
	name?: string;
}

interface AuthResponse {
	user: User;
	message?: string;
}

interface LoginData {
	email: string;
	password: string;
}

interface RegisterData {
	email: string;
	password: string;
	name?: string;
}

const mockUser: User = {
	id: 1,
	email: 'test@example.com',
	name: 'Test User'
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	setUser: Mock;
	loginMutation: UseMutationResult<AuthResponse, Error, LoginData, unknown>;
	registerMutation: UseMutationResult<AuthResponse, Error, RegisterData, unknown>;
	logout: Mock;
}

const mockAuthContext: AuthContextType = {
	user: mockUser,
	isLoading: false,
	isAuthenticated: true,
	setUser: vi.fn(),
	loginMutation: {} as UseMutationResult<AuthResponse, Error, LoginData, unknown>,
	registerMutation: {} as UseMutationResult<AuthResponse, Error, RegisterData, unknown>,
	logout: vi.fn(),
}

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement, authContextValue: AuthContextType = mockAuthContext) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	})

	return render(
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<AuthContext.Provider value={authContextValue}>
					{component}
				</AuthContext.Provider>
			</ThemeProvider>
		</QueryClientProvider>
	)
}

describe('Dashboard', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders welcome message with user name', () => {
		renderWithProviders(<Dashboard />)

		expect(screen.getByText('Bienvenue, Test User !')).toBeInTheDocument()
	})

	it('renders welcome message with "utilisateur" when no name', () => {
		const contextWithoutName = {
			...mockAuthContext,
			user: { ...mockUser, name: undefined }
		}

		renderWithProviders(<Dashboard />, contextWithoutName)

		expect(screen.getByText('Bienvenue, utilisateur !')).toBeInTheDocument()
	})

	it('displays project count correctly', () => {
		renderWithProviders(<Dashboard />)

		expect(screen.getByText('Projets actifs')).toBeInTheDocument()
		expect(screen.getByText('sur 7 au total')).toBeInTheDocument() // Check total projects
	})

	it('renders dashboard header with navigation elements', () => {
		renderWithProviders(<Dashboard />)

		expect(screen.getByText('Dashboard')).toBeInTheDocument()
		expect(screen.getByText('Déconnexion')).toBeInTheDocument()
	})

	it('calls logout when logout button is clicked', () => {
		renderWithProviders(<Dashboard />)

		const logoutButton = screen.getByText('Déconnexion')
		fireEvent.click(logoutButton)

		expect(mockAuthContext.logout).toHaveBeenCalledTimes(1)
	})

	it('navigates to settings when settings button is clicked', () => {
		renderWithProviders(<Dashboard />)

		const settingsButton = screen.getByTitle('Paramètres')
		fireEvent.click(settingsButton)

		expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings' })
	})

	it('renders notification badge', () => {
		renderWithProviders(<Dashboard />)

		expect(screen.getAllByText('3')).toHaveLength(2) // Notification count appears twice
	})

	it('renders stats cards', () => {
		renderWithProviders(<Dashboard />)

		expect(screen.getByText('Projets actifs')).toBeInTheDocument()
		expect(screen.getByText('Tâches complétées')).toBeInTheDocument()
	})

	it('renders all statistics cards', () => {
		renderWithProviders(<Dashboard />)

		// Test that the main sections are rendered
		expect(screen.getByText('Répartition des tâches')).toBeInTheDocument()
		expect(screen.getByText('État des projets')).toBeInTheDocument()

		// Test specific status labels
		expect(screen.getByText('En attente')).toBeInTheDocument()
		expect(screen.getAllByText('En cours')).toHaveLength(2) // Appears in both task and project stats
		expect(screen.getByText('Terminés')).toBeInTheDocument()

		// Test some key numbers that appear
		expect(screen.getAllByText('48')).toHaveLength(2) // Completed tasks appears twice
		expect(screen.getByText('5')).toBeInTheDocument() // Projects pending
		expect(screen.getAllByText('12')).toHaveLength(2) // Completed projects also appears twice
	})

	it('renders navigation cards', () => {
		renderWithProviders(<Dashboard />)

		expect(screen.getByText('Nouveau projet')).toBeInTheDocument()
		expect(screen.getByText('Mes projets')).toBeInTheDocument()
	})

	it('handles loading state', () => {
		const loadingContext = {
			...mockAuthContext,
			isLoading: true
		}

		renderWithProviders(<Dashboard />, loadingContext)

		expect(screen.getByText('Dashboard')).toBeInTheDocument()
	})

	it('handles user not authenticated', () => {
		const unauthenticatedContext = {
			...mockAuthContext,
			user: null,
			isAuthenticated: false
		}

		renderWithProviders(<Dashboard />, unauthenticatedContext)

		expect(screen.getByText('Bienvenue, utilisateur !')).toBeInTheDocument()
	})
})
