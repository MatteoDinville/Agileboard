import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MembersListOnly from '../../components/MembersListOnly';

vi.mock('../../utils/hooks/project', () => ({
	useProjectMembers: vi.fn(),
	useAddProjectMember: vi.fn(),
	useRemoveProjectMember: vi.fn(),
}));

vi.mock('../../utils/hooks/user', () => ({
	useAllUsers: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
	const actual = await vi.importActual('@tanstack/react-router');
	return {
		...actual,
		useParams: vi.fn(),
	};
});

import { useProjectMembers, useAddProjectMember, useRemoveProjectMember } from '../../utils/hooks/project';
import { useAllUsers } from '../../utils/hooks/user';
import { useParams } from '@tanstack/react-router';

const mockUseParams = useParams as ReturnType<typeof vi.fn>;
const mockUseProjectMembers = useProjectMembers as ReturnType<typeof vi.fn>;
const mockUseAddProjectMember = useAddProjectMember as ReturnType<typeof vi.fn>;
const mockUseRemoveProjectMember = useRemoveProjectMember as ReturnType<typeof vi.fn>;
const mockUseAllUsers = useAllUsers as ReturnType<typeof vi.fn>;

const createTestQueryClient = () => new QueryClient({
	defaultOptions: {
		queries: { retry: false },
		mutations: { retry: false },
	},
});

const mockMembers = [
	{
		id: 1,
		user: {
			id: 1,
			email: 'john@example.com',
			name: 'John Doe'
		},
		addedAt: '2024-01-01T00:00:00.000Z'
	},
	{
		id: 2,
		user: {
			id: 2,
			email: 'jane@example.com',
			name: 'Jane Smith'
		},
		addedAt: '2024-01-02T00:00:00.000Z'
	}
];

const mockAllUsers = [
	{ id: 1, email: 'john@example.com', name: 'John Doe' },
	{ id: 2, email: 'jane@example.com', name: 'Jane Smith' },
	{ id: 3, email: 'bob@example.com', name: 'Bob Wilson' },
];

describe('MembersListOnly - Member Assignment', () => {
	let queryClient: QueryClient;
	let addMemberMutate: ReturnType<typeof vi.fn>;
	let removeMemberMutate: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		queryClient = createTestQueryClient();
		addMemberMutate = vi.fn();
		removeMemberMutate = vi.fn();

		mockUseParams.mockReturnValue({ projectId: '1' });
		mockUseProjectMembers.mockReturnValue({
			data: mockMembers,
			isLoading: false,
		});
		mockUseAllUsers.mockReturnValue({
			data: mockAllUsers,
			isLoading: false,
		});
		mockUseAddProjectMember.mockReturnValue({
			mutate: addMemberMutate,
			isPending: false,
		});
		mockUseRemoveProjectMember.mockReturnValue({
			mutate: removeMemberMutate,
			isPending: false,
		});

		global.confirm = vi.fn(() => true);
	});

	it('should display existing members', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		expect(screen.getByTestId('members-list')).toBeInTheDocument();
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		expect(screen.getByText('john@example.com')).toBeInTheDocument();
		expect(screen.getByText('jane@example.com')).toBeInTheDocument();
	});

	it('should open add member modal when clicking add button', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		fireEvent.click(screen.getByTestId('add-member-header-btn'));
		expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();
		expect(screen.getByText('Ajouter un membre')).toBeInTheDocument();
	});

	it('should show available users in modal', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		fireEvent.click(screen.getByTestId('add-member-header-btn'));

		const select = screen.getByTestId('user-select');
		expect(select).toBeInTheDocument();

		expect(screen.getByText(/Bob Wilson/)).toBeInTheDocument();
	});

	it('should add member when selecting user and clicking add', async () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		fireEvent.click(screen.getByTestId('add-member-header-btn'));

		const select = screen.getByTestId('user-select');
		fireEvent.change(select, { target: { value: '3' } });

		fireEvent.click(screen.getByTestId('add-member-btn'));

		expect(addMemberMutate).toHaveBeenCalledWith(
			{ projectId: 1, userId: 3 },
			expect.objectContaining({
				onSuccess: expect.any(Function)
			})
		);
	});

	it('should close modal when clicking cancel', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		fireEvent.click(screen.getByTestId('add-member-header-btn'));
		expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();

		fireEvent.click(screen.getByTestId('cancel-btn'));
		expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
	});

	it('should close modal when clicking close button', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		fireEvent.click(screen.getByTestId('add-member-header-btn'));
		expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();

		fireEvent.click(screen.getByTestId('close-modal-btn'));
		expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
	});

	it('should remove member when clicking remove button', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		fireEvent.click(screen.getByTestId('remove-member-1'));

		expect(global.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir retirer ce membre du projet ?');
		expect(removeMemberMutate).toHaveBeenCalledWith({
			projectId: 1,
			userId: 1
		});
	});

	it('should show loading state when loading members', () => {
		mockUseProjectMembers.mockReturnValue({
			data: undefined,
			isLoading: true,
		});

		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		expect(screen.getByTestId('members-loading')).toBeInTheDocument();
		expect(screen.getByText('Chargement des membres...')).toBeInTheDocument();
	});

	it('should show no members state when no members exist', () => {
		mockUseProjectMembers.mockReturnValue({
			data: [],
			isLoading: false,
		});

		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		expect(screen.getByTestId('no-members')).toBeInTheDocument();
		expect(screen.getByText('Aucun membre')).toBeInTheDocument();
		expect(screen.getByText('Ce projet n\'a pas encore de membres')).toBeInTheDocument();
	});

	it('should allow adding first member when no members exist', () => {
		mockUseProjectMembers.mockReturnValue({
			data: [],
			isLoading: false,
		});

		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		fireEvent.click(screen.getByTestId('add-first-member-btn'));
		expect(screen.getByTestId('add-member-modal')).toBeInTheDocument();
	});

	it('should show users loading state in modal', () => {
		mockUseAllUsers.mockReturnValue({
			data: undefined,
			isLoading: true,
		});

		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		fireEvent.click(screen.getByTestId('add-member-header-btn'));
		expect(screen.getByTestId('users-loading')).toBeInTheDocument();
	});

	it('should show no available users message when all users are members', () => {
		mockUseAllUsers.mockReturnValue({
			data: mockAllUsers.slice(0, 2),
			isLoading: false,
		});

		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		fireEvent.click(screen.getByTestId('add-member-header-btn'));
		expect(screen.getByTestId('no-users-available')).toBeInTheDocument();
		expect(screen.getByText('Aucun utilisateur disponible')).toBeInTheDocument();
	});

	it('should disable add button when no user is selected', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		fireEvent.click(screen.getByTestId('add-member-header-btn'));

		const addButton = screen.getByTestId('add-member-btn');
		expect(addButton).toBeDisabled();
	});

	it('should not show add button for non-owners', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={false} />
			</QueryClientProvider>
		);

		expect(screen.queryByTestId('add-member-header-btn')).not.toBeInTheDocument();
	});

	it('should not show remove buttons for non-owners', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={false} />
			</QueryClientProvider>
		);

		expect(screen.queryByTestId('remove-member-1')).not.toBeInTheDocument();
		expect(screen.queryByTestId('remove-member-2')).not.toBeInTheDocument();
	});

	it('should show add button loading state during mutation', () => {
		mockUseAddProjectMember.mockReturnValue({
			mutate: addMemberMutate,
			isPending: true,
		});

		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		fireEvent.click(screen.getByTestId('add-member-header-btn'));

		const select = screen.getByTestId('user-select');
		fireEvent.change(select, { target: { value: '3' } });

		const addButton = screen.getByTestId('add-member-btn');
		expect(addButton).toBeDisabled();
		expect(screen.getByText('Ajout en cours...')).toBeInTheDocument();
	});

	it('should handle member addition success callback', async () => {
		addMemberMutate.mockImplementation((_args, options) => {
			options.onSuccess();
		});

		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly isOwner={true} />
			</QueryClientProvider>
		);

		fireEvent.click(screen.getByTestId('add-member-header-btn'));

		const select = screen.getByTestId('user-select');
		fireEvent.change(select, { target: { value: '3' } });

		fireEvent.click(screen.getByTestId('add-member-btn'));

		await waitFor(() => {
			expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
		});
	});
});
