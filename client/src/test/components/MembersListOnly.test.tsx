import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MembersListOnly from '../../components/MembersListOnly';

vi.mock('../../utils/hooks/project', () => ({
	useProjectMembers: vi.fn(),
	useRemoveProjectMember: vi.fn(),
}));



vi.mock('../../components/InviteModal', () => ({
	default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
		if (isOpen) {
			return (
				<div data-testid="invite-modal">
					<button data-testid="close-invite-modal" onClick={onClose}>
						Close
					</button>
				</div>
			);
		}
		return null;
	},
}));

vi.mock('../../components/PendingInvitations', () => ({
	default: () => <div data-testid="pending-invitations" />,
}));

vi.mock('../../components/InvitationHistory', () => ({
	default: () => <div data-testid="invitation-history" />,
}));

vi.mock('@tanstack/react-router', async () => {
	const actual = await vi.importActual('@tanstack/react-router');
	return {
		...actual,
		useParams: vi.fn(),
	};
});

import { useProjectMembers, useRemoveProjectMember } from '../../utils/hooks/project';
import { useParams } from '@tanstack/react-router';

const mockUseParams = useParams as ReturnType<typeof vi.fn>;
const mockUseProjectMembers = useProjectMembers as ReturnType<typeof vi.fn>;
const mockUseRemoveProjectMember = useRemoveProjectMember as ReturnType<typeof vi.fn>;

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



describe('MembersListOnly - Member Assignment', () => {
	let queryClient: QueryClient;
	let removeMemberMutate: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		queryClient = createTestQueryClient();
		removeMemberMutate = vi.fn();

		mockUseParams.mockReturnValue({ projectId: '1' });
		mockUseProjectMembers.mockReturnValue({
			data: mockMembers,
			isLoading: false,
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
				<MembersListOnly projectId={1} isOwner={true} />
			</QueryClientProvider>
		);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		expect(screen.getByText('john@example.com')).toBeInTheDocument();
		expect(screen.getByText('jane@example.com')).toBeInTheDocument();
	});

	it('should open invite modal when clicking invite button', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly projectId={1} isOwner={true} />
			</QueryClientProvider>
		);

		const inviteButton = screen.getByText('Inviter un utilisateur');
		fireEvent.click(inviteButton);
		expect(screen.getByTestId('invite-modal')).toBeInTheDocument();
	});

	it('should remove member when clicking remove button', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly projectId={1} isOwner={true} />
			</QueryClientProvider>
		);

		const removeButtons = screen.getAllByTitle('Retirer du projet');
		fireEvent.click(removeButtons[0]);

		expect(global.confirm).toHaveBeenCalledWith('Voulez-vous vraiment retirer ce membre du projet ?');
		expect(removeMemberMutate).toHaveBeenCalledWith({
			projectId: 1,
			userId: 1
		});
	});

	it('should show loading state when loading members', async () => {
		mockUseProjectMembers.mockReturnValue({
			data: undefined,
			isLoading: true,
		});

		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly projectId={1} isOwner={true} />
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByText('Chargement des membres...')).toBeInTheDocument();
		});
	});

	it('should show no members state when no members exist', () => {
		mockUseProjectMembers.mockReturnValue({
			data: [],
			isLoading: false,
		});

		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly projectId={1} isOwner={true} />
			</QueryClientProvider>
		);

		expect(screen.getByText('Aucun membre')).toBeInTheDocument();
		expect(screen.getByText('Ce projet n\'a pas encore de membres')).toBeInTheDocument();
	});

	it('should allow inviting first member when no members exist', () => {
		mockUseProjectMembers.mockReturnValue({
			data: [],
			isLoading: false,
		});

		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly projectId={1} isOwner={true} />
			</QueryClientProvider>
		);

		const inviteButton = screen.getByText('Inviter un utilisateur');
		fireEvent.click(inviteButton);
		expect(screen.getByTestId('invite-modal')).toBeInTheDocument();
	});

	it('should not show invite button for non-owners', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly projectId={1} isOwner={false} />
			</QueryClientProvider>
		);

		expect(screen.queryByText('Inviter un utilisateur')).not.toBeInTheDocument();
	});

	it('should not show remove buttons for non-owners', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<MembersListOnly projectId={1} isOwner={false} />
			</QueryClientProvider>
		);

		expect(screen.queryByTitle('Retirer du projet')).not.toBeInTheDocument();
	});
});
