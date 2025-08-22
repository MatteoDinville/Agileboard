import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectCard } from '../../components/ProjectCard'
import type { Project } from '../../services/project'

vi.mock('@tanstack/react-router', () => ({
	Link: ({ children, ...props }: { children: React.ReactNode;[key: string]: unknown }) => <a {...props}>{children}</a>,
}))

vi.mock('../../utils/hooks/project', () => ({
	useDeleteProject: vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
	default: {
		success: vi.fn(),
		error: vi.fn(),
	},
}))

vi.mock('lucide-react', () => ({
	Calendar: () => <div data-testid="calendar-icon" />,
	Check: () => <div data-testid="check-icon" />,
	Crown: () => <div data-testid="crown-icon" />,
	Edit3: () => <div data-testid="edit-icon" />,
	FolderOpen: () => <div data-testid="folder-icon" />,
	Trash2: () => <div data-testid="trash-icon" />,
	UserCheck: () => <div data-testid="user-check-icon" />,
	Users: () => <div data-testid="users-icon" />,
}))

const mockProject: Project = {
	id: 1,
	title: 'Test Project',
	description: 'Test project description',
	status: 'En cours',
	priority: 'Haute',
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-02T00:00:00Z',
	ownerId: 1,
	members: [
		{
			id: 1,
			userId: 1,
			projectId: 1,
			addedAt: '2024-01-01T00:00:00Z',
			user: { id: 1, name: 'John Doe', email: 'john@example.com' }
		}
	]
}

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

describe('ProjectCard', () => {
	const mockMutate = vi.fn()
	global.confirm = vi.fn(() => true)

	beforeEach(async () => {
		vi.clearAllMocks()
		const { useDeleteProject } = await import('../../utils/hooks/project')
		vi.mocked(useDeleteProject).mockReturnValue({
			mutate: mockMutate,
		} as unknown as ReturnType<typeof useDeleteProject>)
	})

	it('should render project information correctly in grid view', () => {
		render(
			<ProjectCard
				viewMode="grid"
				project={mockProject}
				isOwner={true}
			/>,
			{ wrapper: createWrapper() }
		)

		expect(screen.getByText('Test Project')).toBeInTheDocument()
		expect(screen.getByText('Test project description')).toBeInTheDocument()
		expect(screen.getByTestId('crown-icon')).toBeInTheDocument()
	})

	it('should render project information correctly in list view', () => {
		render(
			<ProjectCard
				viewMode="list"
				project={mockProject}
				isOwner={false}
			/>,
			{ wrapper: createWrapper() }
		)

		expect(screen.getByText('Test Project')).toBeInTheDocument()
		expect(screen.getByText('Test project description')).toBeInTheDocument()
		expect(screen.getByTestId('user-check-icon')).toBeInTheDocument()
	})

	it('should show owner icon when user is owner', () => {
		render(
			<ProjectCard
				viewMode="grid"
				project={mockProject}
				isOwner={true}
			/>,
			{ wrapper: createWrapper() }
		)

		expect(screen.getByTestId('crown-icon')).toBeInTheDocument()
	})

	it('should show member icon when user is not owner', () => {
		render(
			<ProjectCard
				viewMode="grid"
				project={mockProject}
				isOwner={false}
			/>,
			{ wrapper: createWrapper() }
		)

		expect(screen.getByTestId('user-check-icon')).toBeInTheDocument()
	})

	it('should show edit and delete buttons when user is owner', () => {
		render(
			<ProjectCard
				viewMode="grid"
				project={mockProject}
				isOwner={true}
			/>,
			{ wrapper: createWrapper() }
		)

		expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
		expect(screen.getByTestId('trash-icon')).toBeInTheDocument()
	})

	it('should not show edit and delete buttons when user is not owner', () => {
		render(
			<ProjectCard
				viewMode="grid"
				project={mockProject}
				isOwner={false}
			/>,
			{ wrapper: createWrapper() }
		)

		expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument()
		expect(screen.queryByTestId('trash-icon')).not.toBeInTheDocument()
	})

	it('should display project status with correct styling', () => {
		render(
			<ProjectCard
				viewMode="grid"
				project={mockProject}
				isOwner={true}
			/>,
			{ wrapper: createWrapper() }
		)

		const statusElement = screen.getByText('En cours')
		expect(statusElement).toBeInTheDocument()
	})

	it('should display project priority with correct styling', () => {
		render(
			<ProjectCard
				viewMode="grid"
				project={mockProject}
				isOwner={true}
			/>,
			{ wrapper: createWrapper() }
		)

		const priorityElement = screen.getByText('Haute')
		expect(priorityElement).toBeInTheDocument()
	})

	it('should display member count when members exist', () => {
		render(
			<ProjectCard
				viewMode="grid"
				project={mockProject}
				isOwner={true}
			/>,
			{ wrapper: createWrapper() }
		)

		expect(screen.getByText('1')).toBeInTheDocument()
		expect(screen.getByTestId('users-icon')).toBeInTheDocument()
	})

	it('should handle delete action when owner clicks delete button', () => {
		render(
			<ProjectCard
				viewMode="grid"
				project={mockProject}
				isOwner={true}
			/>,
			{ wrapper: createWrapper() }
		)

		const deleteButton = screen.getByTestId('trash-icon').closest('button')
		fireEvent.click(deleteButton!)

		expect(global.confirm).toHaveBeenCalledWith('Voulez-vous vraiment supprimer ce projet ?')
		expect(mockMutate).toHaveBeenCalledWith(1, expect.objectContaining({
			onSuccess: expect.any(Function),
			onError: expect.any(Function)
		}))
	})

	it('should not delete when user cancels confirmation', () => {
		global.confirm = vi.fn(() => false)

		render(
			<ProjectCard
				viewMode="grid"
				project={mockProject}
				isOwner={true}
			/>,
			{ wrapper: createWrapper() }
		)

		const deleteButton = screen.getByTestId('trash-icon').closest('button')
		fireEvent.click(deleteButton!)

		expect(global.confirm).toHaveBeenCalledWith('Voulez-vous vraiment supprimer ce projet ?')
		expect(mockMutate).not.toHaveBeenCalled()
	})

	it('should display updated date', () => {
		render(
			<ProjectCard
				viewMode="grid"
				project={mockProject}
				isOwner={true}
			/>,
			{ wrapper: createWrapper() }
		)

		expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
	})
})