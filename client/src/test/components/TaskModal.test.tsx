import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TaskModal from '../../components/TaskModal';
import { TaskStatus, TaskPriority } from '../../types/enums';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
	X: () => <div>X</div>,
	Save: () => <div>Save</div>,
	Calendar: () => <div>Calendar</div>,
	User: () => <div>User</div>,
	Flag: () => <div>Flag</div>,
	FileText: () => <div>FileText</div>,
	ChevronDown: () => <div>ChevronDown</div>,
}));

vi.mock('../../services/project', () => ({
	projectService: {
		fetchProjectMembers: vi.fn(),
	},
}));

import { projectService } from '../../services/project';

const mockProjectService = projectService as typeof projectService & {
	fetchProjectMembers: ReturnType<typeof vi.fn>;
}

const createTestQueryClient = () => new QueryClient({
	defaultOptions: {
		queries: { retry: false },
		mutations: { retry: false },
	},
});

const mockMembers = [
	{
		user: {
			id: 1,
			email: 'john@example.com',
			name: 'John Doe'
		}
	},
	{
		user: {
			id: 2,
			email: 'jane@example.com',
			name: 'Jane Smith'
		}
	}
];

describe('TaskModal - Task Creation', () => {
	let queryClient: QueryClient;
	let mockOnSave: ReturnType<typeof vi.fn>;
	let mockOnClose: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		queryClient = createTestQueryClient();
		mockOnSave = vi.fn().mockResolvedValue(undefined);
		mockOnClose = vi.fn();

		mockProjectService.fetchProjectMembers.mockResolvedValue(mockMembers);
	});

	it('should display task creation form when opened', async () => {
		render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/titre de la tâche/i)).toBeInTheDocument();
		});

		expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/date d'échéance/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/assigné à/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/statut/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/priorité/i)).toBeInTheDocument();
	});

	it('should create task with required fields', async () => {
		render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/titre de la tâche/i)).toBeInTheDocument();
		});

		const titleInput = screen.getByLabelText(/titre de la tâche/i);
		const descriptionInput = screen.getByLabelText(/description/i);

		fireEvent.change(titleInput, { target: { value: 'New Task Title' } });
		fireEvent.change(descriptionInput, { target: { value: 'Task description' } });

		const saveButton = screen.getByRole('button', { name: /créer/i });
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(mockOnSave).toHaveBeenCalledWith({
				title: 'New Task Title',
				description: 'Task description',
				status: TaskStatus.A_FAIRE,
				priority: TaskPriority.MOYENNE,
				dueDate: undefined,
				assignedToId: undefined,
				projectId: 1,
			});
		});
	});

	it('should create task with all fields filled', async () => {
		render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/titre de la tâche/i)).toBeInTheDocument();
		});

		const titleInput = screen.getByLabelText(/titre de la tâche/i);
		const descriptionInput = screen.getByLabelText(/description/i);
		const dueDateInput = screen.getByLabelText(/date d'échéance/i);
		const assignedToSelect = screen.getByLabelText(/assigné à/i);
		const statusSelect = screen.getByLabelText(/statut/i);
		const prioritySelect = screen.getByLabelText(/priorité/i);

		fireEvent.change(titleInput, { target: { value: 'Complete Task' } });
		fireEvent.change(descriptionInput, { target: { value: 'Detailed description' } });
		fireEvent.change(dueDateInput, { target: { value: '2024-12-31' } });
		fireEvent.change(assignedToSelect, { target: { value: '1' } });
		fireEvent.change(statusSelect, { target: { value: TaskStatus.EN_COURS } });
		fireEvent.change(prioritySelect, { target: { value: TaskPriority.HAUTE } });

		const saveButton = screen.getByRole('button', { name: /créer/i });
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(mockOnSave).toHaveBeenCalledWith({
				title: 'Complete Task',
				description: 'Detailed description',
				status: TaskStatus.EN_COURS,
				priority: TaskPriority.HAUTE,
				dueDate: '2024-12-31',
				assignedToId: 1,
				projectId: 1,
			});
		});
	});

	it('should create task with specific status when provided', async () => {
		const task = {
			status: TaskStatus.EN_COURS,
			id: 0,
			title: '',
			priority: TaskPriority.MOYENNE,
			createdAt: '',
			updatedAt: '',
			projectId: 1
		};

		render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={task}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/titre de la tâche/i)).toBeInTheDocument();
		});

		const statusSelect = screen.getByLabelText(/statut/i) as HTMLSelectElement;
		expect(statusSelect.value).toBe(TaskStatus.EN_COURS);
	});

	it('should load and display project members in assignment dropdown', async () => {
		render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(mockProjectService.fetchProjectMembers).toHaveBeenCalledWith(1);
		});

		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		});
	});

	it('should disable save button when title is empty', async () => {
		render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/titre de la tâche/i)).toBeInTheDocument();
		});

		const saveButton = screen.getByRole('button', { name: /créer/i });
		expect(saveButton).toBeDisabled();
	});

	it('should enable save button when title is provided', async () => {
		render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/titre de la tâche/i)).toBeInTheDocument();
		});

		const titleInput = screen.getByLabelText(/titre de la tâche/i);
		fireEvent.change(titleInput, { target: { value: 'New Task' } });

		const saveButton = screen.getByRole('button', { name: /créer/i });
		expect(saveButton).not.toBeDisabled();
	});

	it('should close modal when clicking cancel', async () => {
		render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/titre de la tâche/i)).toBeInTheDocument();
		});

		const cancelButton = screen.getByRole('button', { name: /annuler/i });
		fireEvent.click(cancelButton);

		expect(mockOnClose).toHaveBeenCalled();
	});

	it('should show loading state during task creation', async () => {
		let resolvePromise: (value?: unknown) => void = () => { };
		const savePromise = new Promise((resolve) => {
			resolvePromise = resolve;
		});
		mockOnSave.mockReturnValue(savePromise);

		render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/titre de la tâche/i)).toBeInTheDocument();
		});

		const titleInput = screen.getByLabelText(/titre de la tâche/i);
		fireEvent.change(titleInput, { target: { value: 'New Task' } });

		const saveButton = screen.getByRole('button', { name: /créer/i });
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(saveButton).toBeDisabled();
			expect(screen.getByText(/création/i)).toBeInTheDocument();
		});

		resolvePromise();
	});

	it('should update existing task when task prop is provided', async () => {
		const existingTask = {
			id: 1,
			title: 'Existing Task',
			description: 'Existing description',
			status: TaskStatus.EN_COURS,
			priority: TaskPriority.HAUTE,
			dueDate: '2024-01-15T00:00:00.000Z',
			assignedToId: 1,
			createdAt: '2024-01-01T00:00:00.000Z',
			updatedAt: '2024-01-01T00:00:00.000Z',
			projectId: 1,
		};

		render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={existingTask}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
		});

		expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
		expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();

		const titleInput = screen.getByLabelText(/titre de la tâche/i);
		fireEvent.change(titleInput, { target: { value: 'Updated Task' } });

		const saveButton = screen.getByRole('button', { name: /modifier/i });
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(mockOnSave).toHaveBeenCalledWith({
				title: 'Updated Task',
				description: 'Existing description',
				status: TaskStatus.EN_COURS,
				priority: TaskPriority.HAUTE,
				dueDate: '2024-01-15',
				assignedToId: 1,
				projectId: 1,
			});
		});
	});

	it('should not render when modal is closed', () => {
		render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={false}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		expect(screen.queryByLabelText(/titre de la tâche/i)).not.toBeInTheDocument();
	});

	it('should handle empty due date', async () => {
		render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/titre de la tâche/i)).toBeInTheDocument();
		});

		const titleInput = screen.getByLabelText(/titre de la tâche/i);
		fireEvent.change(titleInput, { target: { value: 'Task without due date' } });

		const saveButton = screen.getByRole('button', { name: /créer/i });
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(mockOnSave).toHaveBeenCalledWith({
				title: 'Task without due date',
				description: undefined,
				status: TaskStatus.A_FAIRE,
				priority: TaskPriority.MOYENNE,
				dueDate: undefined,
				assignedToId: undefined,
				projectId: 1,
			});
		});
	});

	it('should reset form when modal is reopened', async () => {
		const { rerender } = render(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			expect(screen.getByLabelText(/titre de la tâche/i)).toBeInTheDocument();
		});

		const titleInput = screen.getByLabelText(/titre de la tâche/i);
		fireEvent.change(titleInput, { target: { value: 'Some title' } });

		// Close modal
		rerender(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={false}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		// Reopen modal
		rerender(
			<QueryClientProvider client={queryClient}>
				<TaskModal
					isOpen={true}
					onClose={mockOnClose}
					task={null}
					onSave={mockOnSave}
					projectId={1}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			const resetTitleInput = screen.getByLabelText(/titre de la tâche/i) as HTMLInputElement;
			expect(resetTitleInput.value).toBe('');
		});
	});
});
