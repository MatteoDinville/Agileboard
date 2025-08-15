import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MembersListOnly from '../../components/MembersListOnly'
import { useProjectMembers, useRemoveProjectMember, useAddProjectMember } from '../../utils/hooks/project'
import { useAllUsers } from '../../utils/hooks/user'

interface ReactNodeProps {
	children: React.ReactNode;
}

interface IconProps {
	className?: string;
}

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
		QueryClientProvider: ({ children }: ReactNodeProps) => children,
	}
})

vi.mock('lucide-react', () => ({
	Mail: ({ className }: IconProps) => <div data-testid="mail-icon" className={className} />,
	Loader2: ({ className }: IconProps) => <div data-testid="loader-icon" className={className} />,
	Users: ({ className }: IconProps) => <div data-testid="users-icon" className={className} />,
	UserMinus: ({ className }: IconProps) => <div data-testid="user-minus-icon" className={className} />,
	UserPlus: ({ className }: IconProps) => <div data-testid="user-plus-icon" className={className} />,
	X: ({ className }: IconProps) => <div data-testid="x-icon" className={className} />,
	AlertCircle: ({ className }: IconProps) => <div data-testid="alert-circle-icon" className={className} />,
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

describe('MembersListOnly', () => {
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
			})

			vi.mocked(useAllUsers).mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: false,
				isFetching: false,
				refetch: vi.fn(),
			})

			vi.mocked(useRemoveProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			})

			vi.mocked(useAddProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			})

			render(<MembersListOnly projectId={1} />, { wrapper: createWrapper() })

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
			})

			vi.mocked(useAllUsers).mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: true,
				isFetching: false,
				refetch: vi.fn(),
			})

			vi.mocked(useRemoveProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			})

			vi.mocked(useAddProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			})
		})

		it('should show empty state when no members', () => {
			render(<MembersListOnly projectId={1} />, { wrapper: createWrapper() })

			expect(screen.getByText('Aucun membre')).toBeInTheDocument()
			expect(screen.getByText("Ce projet n'a pas encore de membres")).toBeInTheDocument()
			expect(screen.getByTestId('users-icon')).toBeInTheDocument()
		})

		it('should show add member button when user is owner', () => {
			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			expect(screen.getByText('Ajouter un membre')).toBeInTheDocument()
			expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument()
		})

		it('should not show add member button when user is not owner', () => {
			render(<MembersListOnly projectId={1} isOwner={false} />, { wrapper: createWrapper() })

			expect(screen.queryByText('Ajouter un membre')).not.toBeInTheDocument()
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
			})

			vi.mocked(useAllUsers).mockReturnValue({
				data: mockAllUsers,
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: true,
				isFetching: false,
				refetch: vi.fn(),
			})

			vi.mocked(useRemoveProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			})

			vi.mocked(useAddProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			})
		})

		it('should render members list correctly', () => {
			render(<MembersListOnly projectId={1} />, { wrapper: createWrapper() })

			expect(screen.getByText('John Doe')).toBeInTheDocument()
			expect(screen.getByText('Jane Smith')).toBeInTheDocument()
			expect(screen.getByText('john@example.com')).toBeInTheDocument()
			expect(screen.getByText('jane@example.com')).toBeInTheDocument()
			expect(screen.getAllByTestId('mail-icon')).toHaveLength(2)
		})

		it('should use email initial when member has no name', () => {
			vi.mocked(useProjectMembers).mockReturnValue({
				data: [
					{
						id: 1,
						userId: 1,
						projectId: 1,
						role: 'MEMBER',
						user: { id: 1, name: null, email: 'test@example.com' }
					}
				],
				isLoading: false,
				isError: false,
				error: null
			})

			render(<MembersListOnly projectId={1} isOwner={false} />, { wrapper: createWrapper() })

			expect(screen.getByText('T')).toBeInTheDocument()
			expect(screen.getByText('Utilisateur')).toBeInTheDocument()
			expect(screen.getByText('test@example.com')).toBeInTheDocument()
		})

		it('should show member count in header when owner', () => {
			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			expect(screen.getByText('Membres du projet (2)')).toBeInTheDocument()
		})

		it('should show add button in header when owner', () => {
			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			expect(screen.getByText('Ajouter')).toBeInTheDocument()
		})

		it('should handle member removal when owner', () => {
			const mockRemoveMember = vi.fn()
			vi.mocked(useRemoveProjectMember).mockReturnValue({
				mutate: mockRemoveMember,
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			})

			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const removeButtons = screen.getAllByTestId('user-minus-icon')
			fireEvent.click(removeButtons[0])

			expect(mockConfirm).toHaveBeenCalledWith('Voulez-vous vraiment retirer ce membre du projet ?')
			expect(mockRemoveMember).toHaveBeenCalledWith({ projectId: 1, userId: 1 })
		})

		it('should not show remove buttons when not owner', () => {
			render(<MembersListOnly projectId={1} isOwner={false} />, { wrapper: createWrapper() })

			expect(screen.queryByTestId('user-minus-icon')).not.toBeInTheDocument()
		})

		it('should show loading state on remove button when pending', () => {
			vi.mocked(useRemoveProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: true,
				isSuccess: false,
				isError: false,
				error: null,
			})

			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

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
			})

			vi.mocked(useAllUsers).mockReturnValue({
				data: mockAllUsers,
				isLoading: false,
				error: null,
				isError: false,
				isSuccess: true,
				isFetching: false,
				refetch: vi.fn(),
			})

			vi.mocked(useRemoveProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			})

			vi.mocked(useAddProjectMember).mockReturnValue({
				mutate: vi.fn(),
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			})
		})

		it('should open add member modal when add button is clicked', () => {
			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			expect(screen.getByText('Ajouter un membre')).toBeInTheDocument()
			expect(screen.getByText('Sélectionner un utilisateur')).toBeInTheDocument()
		})

		it('should show available users in select', () => {
			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			expect(screen.getByText('Jane Smith (jane@example.com)')).toBeInTheDocument()
			expect(screen.queryByText('John Doe (john@example.com)')).not.toBeInTheDocument() // Already a member
		})

		it('should handle member addition', () => {
			const mockAddMember = vi.fn()
			vi.mocked(useAddProjectMember).mockReturnValue({
				mutate: mockAddMember,
				isPending: false,
				isSuccess: false,
				isError: false,
				error: null,
			})

			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			const select = screen.getByRole('combobox')
			fireEvent.change(select, { target: { value: '2' } })

			const addMemberButton = screen.getByText('Ajouter au projet')
			fireEvent.click(addMemberButton)

			expect(mockAddMember).toHaveBeenCalledWith(
				{ projectId: 1, userId: 2 },
				expect.objectContaining({
					onSuccess: expect.any(Function)
				})
			)

			const onSuccessCallback = mockAddMember.mock.calls[0][1].onSuccess
			act(() => {
				onSuccessCallback()
			})

			expect(screen.queryByText('Ajouter un membre')).not.toBeInTheDocument()
		})

		it('should handle member addition with loading state', () => {
			const mockAddMember = vi.fn()
			vi.mocked(useAddProjectMember).mockReturnValue({
				mutate: mockAddMember,
				isPending: true,
				isSuccess: false,
				isError: false,
				error: null,
			})

			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			const select = screen.getByRole('combobox')
			fireEvent.change(select, { target: { value: '2' } })

			expect(screen.getByText('Ajout en cours...')).toBeInTheDocument()
			expect(screen.queryByText('Ajouter au projet')).not.toBeInTheDocument()
		})

		it('should close modal when cancel is clicked', () => {
			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			const cancelButton = screen.getByText('Annuler')
			fireEvent.click(cancelButton)

			expect(screen.queryByText('Ajouter un membre')).not.toBeInTheDocument()
		})

		it('should close modal when X button is clicked', () => {
			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

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
			})

			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

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
			})

			render(<MembersListOnly projectId={1} isOwner={true} />, { wrapper: createWrapper() })

			const addButton = screen.getByText('Ajouter')
			fireEvent.click(addButton)

			expect(screen.getByText('Aucun utilisateur disponible')).toBeInTheDocument()
			expect(screen.getByText('Tous les utilisateurs sont déjà membres de ce projet')).toBeInTheDocument()
			expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
		})
	})
})
