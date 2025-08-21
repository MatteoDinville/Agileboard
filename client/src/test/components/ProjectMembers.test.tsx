import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import ProjectMembers from '../../components/ProjectMembers'
import { useProjectMembers, useRemoveProjectMember, useAddProjectMember } from '../../utils/hooks/project'
import { useAllUsers } from '../../utils/hooks/user'
import type { ProjectMember } from '../../services/project'
import type { IUser } from '../../services/user'

type MockIconProps = { className?: string }
vi.mock('../../utils/hooks/project', () => ({
	useProjectMembers: vi.fn(),
	useRemoveProjectMember: vi.fn(),
	useAddProjectMember: vi.fn(),
}))

vi.mock('../../utils/hooks/user', () => ({
	useAllUsers: vi.fn(),
}))

vi.mock('@tanstack/react-query', async () => {
	const actual = await vi.importActual('@tanstack/react-query')
	return {
		...actual,
		QueryClient: vi.fn().mockImplementation(() => ({
			setDefaultOptions: vi.fn(),
			getQueryData: vi.fn(),
			setQueryData: vi.fn(),
			invalidateQueries: vi.fn(),
		})),
		QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
	}
})

vi.mock('lucide-react', () => ({
	Users: ({ className }: MockIconProps) => <div data-testid="users-icon" className={className} />,
	UserPlus: ({ className }: MockIconProps) => <div data-testid="user-plus-icon" className={className} />,
	UserMinus: ({ className }: MockIconProps) => <div data-testid="user-minus-icon" className={className} />,
	Mail: ({ className }: MockIconProps) => <div data-testid="mail-icon" className={className} />,
	X: ({ className }: MockIconProps) => <div data-testid="x-icon" className={className} />,
	Plus: ({ className }: MockIconProps) => <div data-testid="plus-icon" className={className} />,
	AlertCircle: ({ className }: MockIconProps) => <div data-testid="alert-circle-icon" className={className} />,
	Loader2: ({ className }: MockIconProps) => <div data-testid="loader-icon" className={className} />,
}))

const mockConfirm = vi.fn()
Object.defineProperty(window, 'confirm', {
	value: mockConfirm,
	writable: true,
})

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	})

	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	)
}

describe('ProjectMembers', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockConfirm.mockReturnValue(true)
	})

	describe('Loading state', () => {
		it('should show loading state when members are loading', () => {
			vi.mocked(useProjectMembers).mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
				isError: false,
				isSuccess: false,
				isFetching: false,
				refetch: vi.fn(),
			} as unknown as UseQueryResult<ProjectMember[], Error>)

			vi.mocked(useAllUsers).mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: false,
				isFetching: false,
				refetch: vi.fn(),
			} as unknown as UseQueryResult<IUser[], Error>)

			vi.mocked(useRemoveProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			} as unknown as UseMutationResult<void, Error, { projectId: number; userId: number }, unknown>)

			vi.mocked(useAddProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			} as unknown as UseMutationResult<ProjectMember, Error, { projectId: number; userId: number }, unknown>)

			render(<ProjectMembers projectId={1} />, { wrapper: createWrapper() })

			expect(screen.getByText('Chargement des membres...')).toBeInTheDocument()
			expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
		})
	})

	describe('Empty state', () => {
		beforeEach(() => {
			vi.mocked(useProjectMembers).mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: true,
				isFetching: false,
				refetch: vi.fn(),
			} as unknown as UseQueryResult<ProjectMember[], Error>)

			vi.mocked(useAllUsers).mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: true,
				isFetching: false,
				refetch: vi.fn(),
			} as unknown as UseQueryResult<IUser[], Error>)

			vi.mocked(useRemoveProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			} as unknown as UseMutationResult<void, Error, { projectId: number; userId: number }, unknown>)

			vi.mocked(useAddProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			} as unknown as UseMutationResult<ProjectMember, Error, { projectId: number; userId: number }, unknown>)
		})

		it('should show empty state when no members', () => {
			render(<ProjectMembers projectId={1} />, { wrapper: createWrapper() })

			expect(screen.getByText('Aucun membre pour le moment')).toBeInTheDocument()
			expect(screen.getByText('0 membre')).toBeInTheDocument()
		})

		it('should show add button when user is owner', () => {
			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			expect(screen.getByText('Ajouter')).toBeInTheDocument()
			expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument()
		})

		it('should not show add button when user is not owner', () => {
			render(<ProjectMembers projectId={1} isOwner={false} />, { wrapper: createWrapper() })

			expect(screen.queryByText('Ajouter')).not.toBeInTheDocument()
		})
	})

	describe('Members list', () => {
		const mockMembers = [
			{
				id: 1,
				projectId: 1,
				userId: 1,
				role: 'MEMBER',
				joinedAt: '2024-01-01T00:00:00Z',
				addedAt: '2024-01-01T00:00:00Z',
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
				addedAt: '2024-01-01T00:00:00Z',
				user: {
					id: 2,
					name: 'Jane Smith',
					email: 'jane@example.com'
				}
			}
		]

		const mockAllUsers = [
			{
				id: 1,
				name: 'John Doe',
				email: 'john@example.com',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			},
			{
				id: 2,
				name: 'Jane Smith',
				email: 'jane@example.com',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			},
			{
				id: 3,
				name: 'Bob Wilson',
				email: 'bob@example.com',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}
		]

		beforeEach(() => {
			vi.mocked(useProjectMembers).mockReturnValue({
				data: mockMembers,
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: true,
				isFetching: false,
				refetch: vi.fn(),
			} as unknown as UseQueryResult<ProjectMember[], Error>)

			vi.mocked(useAllUsers).mockReturnValue({
				data: mockAllUsers,
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: true,
				isFetching: false,
				refetch: vi.fn(),
			} as unknown as UseQueryResult<IUser[], Error>)

			vi.mocked(useRemoveProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			} as unknown as UseMutationResult<void, Error, { projectId: number; userId: number }, unknown>)

			vi.mocked(useAddProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			} as unknown as UseMutationResult<ProjectMember, Error, { projectId: number; userId: number }, unknown>)
		})

		it('should render members list correctly', () => {
			render(<ProjectMembers projectId={1} />, { wrapper: createWrapper() })

			expect(screen.getByText('John Doe')).toBeInTheDocument()
			expect(screen.getByText('Jane Smith')).toBeInTheDocument()
			expect(screen.getByText('john@example.com')).toBeInTheDocument()
			expect(screen.getByText('jane@example.com')).toBeInTheDocument()
			expect(screen.getByText('2 membres')).toBeInTheDocument()
		})

		it('should show member count correctly for single member', () => {
			vi.mocked(useProjectMembers).mockReturnValue({
				data: [mockMembers[0]],
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: true,
				isFetching: false,
				refetch: vi.fn(),
			} as unknown as UseQueryResult<ProjectMember[], Error>)

			render(<ProjectMembers projectId={1} />, { wrapper: createWrapper() })

			expect(screen.getByText('1 membre')).toBeInTheDocument()
		})

		it('should handle member removal when owner', () => {
			const mockRemoveMember = vi.fn()
			vi.mocked(useRemoveProjectMember).mockReturnValue({
				mutate: mockRemoveMember,
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			} as unknown as UseMutationResult<void, Error, { projectId: number; userId: number }, unknown>)

			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const removeButtons = screen.getAllByTestId('user-minus-icon')
			fireEvent.click(removeButtons[0])

			expect(mockConfirm).toHaveBeenCalledWith('Voulez-vous vraiment retirer ce membre du projet ?')
			expect(mockRemoveMember).toHaveBeenCalledWith({ projectId: 1, userId: 1 })
		})

		it('should not show remove buttons when not owner', () => {
			render(<ProjectMembers projectId={1} isOwner={false} />, { wrapper: createWrapper() })

			expect(screen.queryByTestId('user-minus-icon')).not.toBeInTheDocument()
		})

		it('should show loading state on remove button when pending', () => {
			vi.mocked(useRemoveProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: true,
				isSuccess: false,
				isError: false,
				error: null,
			} as unknown as UseMutationResult<void, Error, { projectId: number; userId: number }, unknown>)

			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			expect(screen.getAllByTestId('loader-icon')).toHaveLength(2)
		})
	})

	describe('Add member modal', () => {
		const mockMembers = [
			{
				id: 1,
				projectId: 1,
				userId: 1,
				role: 'MEMBER',
				joinedAt: '2024-01-01T00:00:00Z',
				addedAt: '2024-01-01T00:00:00Z',
				user: {
					id: 1,
					name: 'John Doe',
					email: 'john@example.com'
				}
			}
		]

		const mockAllUsers = [
			{
				id: 1,
				name: 'John Doe',
				email: 'john@example.com',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			},
			{
				id: 2,
				name: 'Jane Smith',
				email: 'jane@example.com',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}
		]

		beforeEach(() => {
			vi.mocked(useProjectMembers).mockReturnValue({
				data: mockMembers,
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: true,
				isFetching: false,
				refetch: vi.fn(),
			} as unknown as UseQueryResult<ProjectMember[], Error>)

			vi.mocked(useAllUsers).mockReturnValue({
				data: mockAllUsers,
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: true,
				isFetching: false,
				refetch: vi.fn(),
			} as unknown as UseQueryResult<IUser[], Error>)

			vi.mocked(useRemoveProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			} as unknown as UseMutationResult<void, Error, { projectId: number; userId: number }, unknown>)

			vi.mocked(useAddProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			} as unknown as UseMutationResult<ProjectMember, Error, { projectId: number; userId: number }, unknown>)
		})

		it('should open add member modal when add button is clicked', () => {
			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			expect(screen.getByText('Ajouter un membre')).toBeInTheDocument()
			expect(screen.getByText('Sélectionnez un utilisateur à ajouter au projet :')).toBeInTheDocument()
		})

		it('should show available users in modal', () => {
			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			expect(screen.getByText('Jane Smith')).toBeInTheDocument()
			expect(screen.getByText('jane@example.com')).toBeInTheDocument()
			const availableUsers = screen.getByText('Sélectionnez un utilisateur à ajouter au projet :').parentElement
			expect(availableUsers).not.toHaveTextContent('John Doe')
		})

		it('should handle user selection in modal', () => {
			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			const userButton = screen.getByText('Jane Smith')
			fireEvent.click(userButton)

			expect(userButton.closest('button')).toHaveClass('border-indigo-500')
		})

		it('should handle member addition', () => {
			const mockAddMember = vi.fn()
			vi.mocked(useAddProjectMember).mockReturnValue({
				mutate: mockAddMember,
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			} as unknown as UseMutationResult<ProjectMember, Error, { projectId: number; userId: number }, unknown>)

			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			const userButton = screen.getByText('Jane Smith')
			fireEvent.click(userButton)

			const addMemberButton = screen.getAllByText('Ajouter')[1]
			fireEvent.click(addMemberButton)

			expect(mockAddMember).toHaveBeenCalledWith(
				{ projectId: 1, userId: 2 },
				expect.objectContaining({
					onSuccess: expect.any(Function)
				})
			)
		})

		it('should close modal when cancel is clicked', () => {
			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			const cancelButton = screen.getByText('Annuler')
			fireEvent.click(cancelButton)

			expect(screen.queryByText('Ajouter un membre')).not.toBeInTheDocument()
		})

		it('should close modal when X button is clicked', () => {
			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			const closeButton = screen.getByTestId('x-icon')
			fireEvent.click(closeButton)

			expect(screen.queryByText('Ajouter un membre')).not.toBeInTheDocument()
		})

		it('should show loading state when users are loading', () => {
			vi.mocked(useAllUsers).mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
				isError: false,
				isSuccess: false,
				isFetching: true,
				refetch: vi.fn(),
			} as unknown as UseQueryResult<IUser[], Error>)

			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			expect(screen.getByText('Chargement des utilisateurs...')).toBeInTheDocument()
		})

		it('should show no available users message when all users are members', () => {
			vi.mocked(useAllUsers).mockReturnValue({
				data: mockMembers.map(m => m.user),
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: true,
				isFetching: false,
				refetch: vi.fn(),
			} as unknown as UseQueryResult<IUser[], Error>)

			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			expect(screen.getByText('Aucun utilisateur disponible à ajouter')).toBeInTheDocument()
			expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
		})

		it('should disable add button when no user is selected', () => {
			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			const addMemberButton = screen.getAllByText('Ajouter')[1].closest('button')
			expect(addMemberButton).toBeDisabled()
		})

		it('should show loading state on add button when pending', () => {
			vi.mocked(useAddProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: true,
				isSuccess: false,
				isError: false,
				error: null,
			} as unknown as UseMutationResult<ProjectMember, Error, { projectId: number; userId: number }, unknown>)

			render(<ProjectMembers projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			const userButton = screen.getByText('Jane Smith')
			fireEvent.click(userButton)

			expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
		})
	})
})
