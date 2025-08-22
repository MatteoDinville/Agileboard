import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
	render, screen, fireEvent
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import ProjectsList from '../../pages/ProjectsList'
import { useProjects, useDeleteProject } from '../../utils/hooks/project'
import type { Project, ProjectStatus, ProjectPriority } from '../../services/project'

vi.mock('@tanstack/react-router', () => ({
	Link: ({ children, to, ...props }: { children: React.ReactNode; to: string;[key: string]: unknown }) => (
		<a href={to} {...props}>{children}</a>
	),
}))

vi.mock('../../utils/hooks/project')


vi.mock('@tanstack/react-query', async (importOriginal) => {
	const actual = await importOriginal() as Record<string, unknown>
	return {
		...actual,
		QueryClient: actual.QueryClient,
		QueryClientProvider: actual.QueryClientProvider,
	}
})


vi.mock('lucide-react', () => ({
	Plus: () => <div data-testid="plus">Plus</div>,
	FolderOpen: () => <div data-testid="folder-open">FolderOpen</div>,
	Edit3: () => <div data-testid="edit3">Edit3</div>,
	Trash2: () => <div data-testid="trash2">Trash2</div>,
	Calendar: () => <div data-testid="calendar">Calendar</div>,
	Search: () => <div data-testid="search">Search</div>,
	Grid3X3: () => <div data-testid="grid3x3">Grid3X3</div>,
	List: () => <div data-testid="list">List</div>,
	ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
	AlertCircle: () => <div data-testid="alert-circle">AlertCircle</div>,
	Loader2: () => <div data-testid="loader2">Loader2</div>,
	Users: () => <div data-testid="users">Users</div>,
	Home: () => <div data-testid="home">Home</div>,
}))

const mockProjects: Project[] = [
	{
		id: 1,
		title: 'Project Alpha',
		description: 'First project description',
		status: 'En cours' as ProjectStatus,
		priority: 'Haute' as ProjectPriority,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-02T00:00:00Z',
		members: [
			{ id: 1, userId: 1, projectId: 1, addedAt: '2024-01-01T00:00:00Z', user: { id: 1, name: 'User 1', email: 'user1@example.com' } },
			{ id: 2, userId: 2, projectId: 1, addedAt: '2024-01-01T00:00:00Z', user: { id: 2, name: 'User 2', email: 'user2@example.com' } }
		],
	},
	{
		id: 2,
		title: 'Project Beta',
		description: 'Second project description',
		status: 'Terminé' as ProjectStatus,
		priority: 'Basse' as ProjectPriority,
		createdAt: '2024-01-03T00:00:00Z',
		updatedAt: '2024-01-04T00:00:00Z',
		members: [],
	},
	{
		id: 3,
		title: 'Project Gamma',
		description: 'Third project description',
		status: 'En attente' as ProjectStatus,
		priority: 'Moyenne' as ProjectPriority,
		createdAt: '2024-01-05T00:00:00Z',
		updatedAt: '2024-01-06T00:00:00Z',
		members: [{ id: 3, userId: 3, projectId: 3, addedAt: '2024-01-03T00:00:00Z', user: { id: 3, name: 'User 3', email: 'user3@example.com' } }],
	},
]

// Mock helpers
const createMockProjects = (data: Project[] | undefined = undefined, options: {
	isLoading?: boolean
	isError?: boolean
	error?: Error | null
} = {}): UseQueryResult<Project[], Error> => ({
	data,
	isLoading: options.isLoading ?? (data === undefined),
	isError: options.isError ?? false,
	error: options.error ?? null,
	refetch: vi.fn(),
	isSuccess: data !== undefined && !options.isError,
	isFetching: false,
	isStale: false,
	dataUpdatedAt: Date.now(),
	errorUpdatedAt: 0,
	failureCount: 0,
	failureReason: null,
	errorUpdateCount: 0,
	isFetched: true,
	isFetchedAfterMount: true,
	isInitialLoading: options.isLoading ?? (data === undefined),
	isLoadingError: false,
	isPlaceholderData: false,
	isPreviousData: false,
	isRefetchError: false,
	isRefetching: false,
	status: options.isError ? 'error' : (data !== undefined ? 'success' : 'loading'),
	fetchStatus: 'idle',
} as unknown as UseQueryResult<Project[], Error>)

const createMockDeleteProject = (overrides = {}): UseMutationResult<void, Error, number, unknown> => ({
	mutate: vi.fn(),
	mutateAsync: vi.fn(),
	isPending: false,
	isError: false,
	isSuccess: false,
	isIdle: true,
	data: undefined,
	error: null,
	variables: undefined,
	context: undefined,
	status: 'idle',
	reset: vi.fn(),
	...overrides,
} as unknown as UseMutationResult<void, Error, number, unknown>)

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


describe('ProjectsList', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		global.confirm = vi.fn(() => true)
	})

	it('should render loading state', () => {
		vi.mocked(useProjects).mockReturnValue(createMockProjects(undefined))
		vi.mocked(useDeleteProject).mockReturnValue(createMockDeleteProject())

		render(<ProjectsList />, { wrapper: createWrapper() })

		expect(screen.getByTestId('loader2')).toBeInTheDocument()
		expect(screen.getByText('Chargement des projets…')).toBeInTheDocument()
	})

	it('should render error state', () => {
		vi.mocked(useProjects).mockReturnValue(createMockProjects(undefined, {
			isLoading: false,
			isError: true,
			error: { message: 'Failed to load projects' } as Error
		}))
		vi.mocked(useDeleteProject).mockReturnValue(createMockDeleteProject())

		render(<ProjectsList />, { wrapper: createWrapper() })

		expect(screen.getByTestId('alert-circle')).toBeInTheDocument()
		expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
		expect(screen.getByText('Erreur : Failed to load projects')).toBeInTheDocument()
	})

	it('should render projects list', () => {
		vi.mocked(useProjects).mockReturnValue(createMockProjects(mockProjects))
		vi.mocked(useDeleteProject).mockReturnValue(createMockDeleteProject())

		render(<ProjectsList />, { wrapper: createWrapper() })

		expect(screen.getByText('Mes Projets')).toBeInTheDocument()
		expect(screen.getByText('Project Alpha')).toBeInTheDocument()
		expect(screen.getByText('Project Beta')).toBeInTheDocument()
		expect(screen.getByText('Project Gamma')).toBeInTheDocument()
		expect(screen.getByText('3')).toBeInTheDocument() // Project count
	})

	it('should render status and priority badges for projects', () => {
		vi.mocked(useProjects).mockReturnValue(createMockProjects(mockProjects, { isLoading: false, isError: false }))
		vi.mocked(useDeleteProject).mockReturnValue(createMockDeleteProject())

		render(<ProjectsList />, { wrapper: createWrapper() })

		const enCoursElements = screen.getAllByText('En cours')
		const termineElements = screen.getAllByText('Terminé')
		const enAttenteElements = screen.getAllByText('En attente')

		expect(enCoursElements.length).toBeGreaterThan(0)
		expect(termineElements.length).toBeGreaterThan(0)
		expect(enAttenteElements.length).toBeGreaterThan(0)

		expect(screen.getByText('Haute')).toBeInTheDocument()
		expect(screen.getByText('Basse')).toBeInTheDocument()
		expect(screen.getByText('Moyenne')).toBeInTheDocument()

		const enCoursBadge = enCoursElements.find(el => el.closest('span')?.classList.contains('px-3'))
		const enCoursBadgeSpan = enCoursBadge?.closest('span')
		expect(enCoursBadgeSpan).toHaveClass('bg-blue-100')
		expect(enCoursBadgeSpan).toHaveClass('text-blue-800')

		const termineBadge = termineElements.find(el => el.closest('span')?.classList.contains('px-3'))
		const termineBadgeSpan = termineBadge?.closest('span')
		expect(termineBadgeSpan).toHaveClass('bg-green-100')
		expect(termineBadgeSpan).toHaveClass('text-green-800')

		const enAttenteBadge = enAttenteElements.find(el => el.closest('span')?.classList.contains('px-3'))
		const enAttenteBadgeSpan = enAttenteBadge?.closest('span')
		expect(enAttenteBadgeSpan).toHaveClass('bg-yellow-100')
		expect(enAttenteBadgeSpan).toHaveClass('text-yellow-800')

		const hauteElement = screen.getByText('Haute').closest('span')
		expect(hauteElement).toHaveClass('bg-red-100')
		expect(hauteElement).toHaveClass('text-red-800')

		const basseElement = screen.getByText('Basse').closest('span')
		expect(basseElement).toHaveClass('bg-green-100')
		expect(basseElement).toHaveClass('text-green-800')

		const moyenneElement = screen.getByText('Moyenne').closest('span')
		expect(moyenneElement).toHaveClass('bg-orange-100')
		expect(moyenneElement).toHaveClass('text-orange-800')
	})

	it('should render projects with undefined status and priority', () => {
		const projectWithoutStatus = {
			id: 4,
			title: 'Project Without Status',
			description: 'Project without status and priority',
			status: undefined,
			priority: undefined,
			createdAt: '2024-01-07T00:00:00Z',
			updatedAt: '2024-01-08T00:00:00Z',
			members: [],
		}

		vi.mocked(useProjects).mockReturnValue(createMockProjects([projectWithoutStatus], { isLoading: false, isError: false }))
		vi.mocked(useDeleteProject).mockReturnValue(createMockDeleteProject())

		render(<ProjectsList />, { wrapper: createWrapper() })

		expect(screen.getByText('Non défini')).toBeInTheDocument()
		expect(screen.getByText('Non définie')).toBeInTheDocument()

		const nonDefiniStatusElement = screen.getByText('Non défini').closest('span')
		expect(nonDefiniStatusElement).toHaveClass('bg-gray-100')
		expect(nonDefiniStatusElement).toHaveClass('text-gray-800')

		const nonDefiniePriorityElement = screen.getByText('Non définie').closest('span')
		expect(nonDefiniePriorityElement).toHaveClass('bg-gray-100')
		expect(nonDefiniePriorityElement).toHaveClass('text-gray-800')
	})

	it('should render status and priority badges in grid mode', () => {
		vi.mocked(useProjects).mockReturnValue(createMockProjects(mockProjects, { isLoading: false, isError: false }))
		vi.mocked(useDeleteProject).mockReturnValue(createMockDeleteProject())

		render(<ProjectsList />, { wrapper: createWrapper() })

		const gridButton = screen.getByTestId('grid3x3').closest('button')
		expect(gridButton).toBeInTheDocument()
		fireEvent.click(gridButton!)

		const enCoursElements = screen.getAllByText('En cours')
		const termineElements = screen.getAllByText('Terminé')
		const enAttenteElements = screen.getAllByText('En attente')

		expect(enCoursElements.length).toBeGreaterThan(0)
		expect(termineElements.length).toBeGreaterThan(0)
		expect(enAttenteElements.length).toBeGreaterThan(0)

		expect(screen.getByText('Haute')).toBeInTheDocument()
		expect(screen.getByText('Basse')).toBeInTheDocument()
		expect(screen.getByText('Moyenne')).toBeInTheDocument()

		const enCoursBadge = enCoursElements.find(el => el.closest('span')?.classList.contains('px-3'))
		const enCoursBadgeSpan = enCoursBadge?.closest('span')
		expect(enCoursBadgeSpan).toHaveClass('bg-blue-100')
		expect(enCoursBadgeSpan).toHaveClass('text-blue-800')

		const hauteElement = screen.getByText('Haute').closest('span')
		expect(hauteElement).toHaveClass('bg-red-100')
		expect(hauteElement).toHaveClass('text-red-800')
	})

	it('should filter projects by search term', () => {
		vi.mocked(useProjects).mockReturnValue(createMockProjects(mockProjects, { isLoading: false, isError: false }))
		vi.mocked(useDeleteProject).mockReturnValue(createMockDeleteProject())

		render(<ProjectsList />, { wrapper: createWrapper() })

		const searchInput = screen.getByPlaceholderText('Rechercher un projet...')
		fireEvent.change(searchInput, { target: { value: 'Alpha' } })

		expect(screen.getByText('Project Alpha')).toBeInTheDocument()
		expect(screen.queryByText('Project Beta')).not.toBeInTheDocument()
		expect(screen.queryByText('Project Gamma')).not.toBeInTheDocument()
		expect(screen.getByText('1')).toBeInTheDocument() // Filtered count
	})

	it('should filter projects by status', () => {
		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		const statusSelect = screen.getByDisplayValue('Tous les statuts')
		fireEvent.change(statusSelect, { target: { value: 'En cours' } })

		expect(screen.getByText('Project Alpha')).toBeInTheDocument()
		expect(screen.queryByText('Project Beta')).not.toBeInTheDocument()
		expect(screen.queryByText('Project Gamma')).not.toBeInTheDocument()
		expect(screen.getByText('1')).toBeInTheDocument() // Filtered count
	})

	it('should switch between list and grid view modes', () => {
		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		const listButton = screen.getByTestId('list').closest('button')
		const gridButton = screen.getByTestId('grid3x3').closest('button')

		expect(listButton).toHaveClass('bg-white')
		expect(gridButton).not.toHaveClass('bg-white')

		fireEvent.click(gridButton!)

		expect(gridButton).toHaveClass('bg-white')
		expect(listButton).not.toHaveClass('bg-white')
	})

	it('should handle project deletion', () => {
		const mockMutate = vi.fn()
		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: mockMutate,
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		const deleteButtons = screen.getAllByTestId('trash2')
		fireEvent.click(deleteButtons[0])

		expect(global.confirm).toHaveBeenCalledWith('Voulez-vous vraiment supprimer ce projet ?')
		expect(mockMutate).toHaveBeenCalledWith(1)
	})

	it('should show empty state when no projects', () => {
		vi.mocked(useProjects).mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		expect(screen.getByText('Aucun projet pour le moment')).toBeInTheDocument()
		expect(screen.getByText('Commencez par créer votre premier projet')).toBeInTheDocument()
		expect(screen.getByText('Créer mon premier projet')).toBeInTheDocument()
	})

	it('should show empty state when no projects match search', () => {
		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		const searchInput = screen.getByPlaceholderText('Rechercher un projet...')
		fireEvent.change(searchInput, { target: { value: 'NonExistent' } })

		expect(screen.getByText('Aucun projet trouvé')).toBeInTheDocument()
		expect(screen.getByText('Essayez de modifier vos critères de recherche')).toBeInTheDocument()
	})

	it('should display project status badges correctly', () => {
		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		expect(screen.getAllByText('En cours')).toHaveLength(2) // One in select option, one in badge
		expect(screen.getAllByText('Terminé')).toHaveLength(2) // One in select option, one in badge
		expect(screen.getAllByText('En attente')).toHaveLength(2) // One in select option, one in badge
	})

	it('should display project priority badges correctly', () => {
		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		expect(screen.getByText('Haute')).toBeInTheDocument()
		expect(screen.getByText('Basse')).toBeInTheDocument()
		expect(screen.getByText('Moyenne')).toBeInTheDocument()
	})

	it('should display member count badges', () => {
		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		expect(screen.getByText('2 membres')).toBeInTheDocument()
		expect(screen.getByText('1 membre')).toBeInTheDocument()
	})

	it('should have all status filter options', () => {
		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		const statusSelect = screen.getByDisplayValue('Tous les statuts')
		const options = Array.from(statusSelect.querySelectorAll('option'))

		expect(options).toHaveLength(4)
		expect(options[0]).toHaveValue('Tous')
		expect(options[1]).toHaveValue('En cours')
		expect(options[2]).toHaveValue('Terminé')
		expect(options[3]).toHaveValue('En attente')
	})

	it('should display project dates correctly', () => {
		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		expect(screen.getByText(/2 janv\. 2024/)).toBeInTheDocument()
		expect(screen.getByText(/4 janv\. 2024/)).toBeInTheDocument()
		expect(screen.getByText(/6 janv\. 2024/)).toBeInTheDocument()
	})

	it('should handle projects with undefined status and priority', () => {
		const projectsWithUndefinedValues = [
			{
				id: 4,
				title: 'Project Delta',
				description: 'Project with undefined values',
				status: undefined,
				priority: undefined,
				createdAt: '2024-01-07T00:00:00Z',
				updatedAt: '2024-01-08T00:00:00Z',
				members: [],
			},
		]

		vi.mocked(useProjects).mockReturnValue({
			data: projectsWithUndefinedValues,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		expect(screen.getByText('Project Delta')).toBeInTheDocument()
		expect(screen.getByText('Non défini')).toBeInTheDocument() // Default status
		expect(screen.getByText('Non définie')).toBeInTheDocument() // Default priority
	})

	it('should handle projects with null description', () => {
		const projectsWithNullDescription = [
			{
				id: 5,
				title: 'Project Echo',
				description: null,
				status: 'En cours',
				priority: 'Haute',
				createdAt: '2024-01-09T00:00:00Z',
				updatedAt: '2024-01-10T00:00:00Z',
				members: [],
			},
		]

		vi.mocked(useProjects).mockReturnValue({
			data: projectsWithNullDescription,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		expect(screen.getByText('Project Echo')).toBeInTheDocument()
		expect(screen.getByText('Aucune description fournie pour ce projet')).toBeInTheDocument()
	})

	it('should handle delete project cancellation', () => {
		global.confirm = vi.fn(() => false)

		const mockMutate = vi.fn()
		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: mockMutate,
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		const deleteButtons = screen.getAllByTestId('trash2')
		fireEvent.click(deleteButtons[0])

		expect(global.confirm).toHaveBeenCalledWith('Voulez-vous vraiment supprimer ce projet ?')
		expect(mockMutate).not.toHaveBeenCalled()
	})

	it('should search in project descriptions', () => {
		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		const searchInput = screen.getByPlaceholderText('Rechercher un projet...')
		fireEvent.change(searchInput, { target: { value: 'First project' } })

		expect(screen.getByText('Project Alpha')).toBeInTheDocument()
		expect(screen.queryByText('Project Beta')).not.toBeInTheDocument()
		expect(screen.queryByText('Project Gamma')).not.toBeInTheDocument()
		expect(screen.getByText('1')).toBeInTheDocument() // Filtered count
	})

	it('should show default status and priority colors', () => {
		const projectWithDefaults = [
			{
				id: 6,
				title: 'Project Defaults',
				description: 'Testing default colors',
				status: 'Unknown Status',
				priority: 'Unknown Priority',
				createdAt: '2024-01-11T00:00:00Z',
				updatedAt: '2024-01-12T00:00:00Z',
				members: [],
			},
		]

		vi.mocked(useProjects).mockReturnValue({
			data: projectWithDefaults,
			isLoading: false,
			isError: false,
			error: null,
		} as unknown as UseQueryResult<Project[], Error>)
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: vi.fn(),
		} as unknown as UseMutationResult<void, Error, number>)

		render(<ProjectsList />, { wrapper: createWrapper() })

		expect(screen.getByText('Unknown Status')).toBeInTheDocument()
		expect(screen.getByText('Unknown Priority')).toBeInTheDocument()
	})

	describe('Status and Priority colors', () => {
		it('should test all status color variants', () => {
			const projectsWithAllStatuses = [
				{
					id: 100,
					title: 'En cours Project',
					description: 'Testing en cours status',
					status: 'En cours',
					priority: 'Moyenne',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					members: [],
				},
				{
					id: 101,
					title: 'Terminé Project',
					description: 'Testing terminé status',
					status: 'Terminé',
					priority: 'Moyenne',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					members: [],
				},
				{
					id: 102,
					title: 'En attente Project',
					description: 'Testing en attente status',
					status: 'En attente',
					priority: 'Moyenne',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					members: [],
				},
				{
					id: 103,
					title: 'Default Status Project',
					description: 'Testing default status',
					status: undefined,
					priority: 'Moyenne',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					members: [],
				}
			]

			vi.mocked(useProjects).mockReturnValue({
				data: projectsWithAllStatuses,
				isLoading: false,
				isError: false,
				error: null,
			} as unknown as UseQueryResult<Project[], Error>)
			vi.mocked(useDeleteProject).mockReturnValue({
				mutate: vi.fn(),
			} as unknown as UseMutationResult<void, Error, number>)

			render(<ProjectsList />, { wrapper: createWrapper() })

			expect(screen.getAllByText('En cours')).toHaveLength(2) // One in filter dropdown, one in project
			expect(screen.getAllByText('Terminé')).toHaveLength(2) // One in filter dropdown, one in project
			expect(screen.getAllByText('En attente')).toHaveLength(2) // One in filter dropdown, one in project
			expect(screen.getByText('Non défini')).toBeInTheDocument()
		})

		it('should test all priority color variants', () => {
			const projectsWithAllPriorities = [
				{
					id: 200,
					title: 'Haute Priority Project',
					description: 'Testing haute priority',
					status: 'En cours',
					priority: 'Haute',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					members: [],
				},
				{
					id: 201,
					title: 'Moyenne Priority Project',
					description: 'Testing moyenne priority',
					status: 'En cours',
					priority: 'Moyenne',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					members: [],
				},
				{
					id: 202,
					title: 'Basse Priority Project',
					description: 'Testing basse priority',
					status: 'En cours',
					priority: 'Basse',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					members: [],
				},
				{
					id: 203,
					title: 'Default Priority Project',
					description: 'Testing default priority',
					status: 'En cours',
					priority: undefined,
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					members: [],
				}
			]

			vi.mocked(useProjects).mockReturnValue({
				data: projectsWithAllPriorities,
				isLoading: false,
				isError: false,
				error: null,
			} as unknown as UseQueryResult<Project[], Error>)
			vi.mocked(useDeleteProject).mockReturnValue({
				mutate: vi.fn(),
			} as unknown as UseMutationResult<void, Error, number>)

			render(<ProjectsList />, { wrapper: createWrapper() })

			expect(screen.getByText('Haute')).toBeInTheDocument()
			expect(screen.getByText('Moyenne')).toBeInTheDocument()
			expect(screen.getByText('Basse')).toBeInTheDocument()
			expect(screen.getByText('Non définie')).toBeInTheDocument()
		})
	})
})
