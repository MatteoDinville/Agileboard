import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import KanbanBoard from '../../components/KanbanBoard'
import { taskService } from '../../services/task'
import { TaskStatus, TaskPriority } from '../../types/enums'
import type { Task } from '../../services/task'

vi.mock('../../services/task', () => ({
	taskService: {
		getProjectTasks: vi.fn(),
		updateTaskStatus: vi.fn(),
		updateTask: vi.fn(),
		createTask: vi.fn(),
	}
}))

vi.mock('@tanstack/react-query', () => ({
	QueryClient: vi.fn().mockImplementation(() => ({
		setDefaultOptions: vi.fn(),
		getQueryData: vi.fn(),
		setQueryData: vi.fn(),
		invalidateQueries: vi.fn(),
	})),
	QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
	useQueryClient: vi.fn(() => ({
		setDefaultOptions: vi.fn(),
		getQueryData: vi.fn(),
		setQueryData: vi.fn(),
		invalidateQueries: vi.fn(),
	})),
	useQuery: vi.fn(() => ({
		data: [],
		isLoading: false,
		error: null,
		isError: false,
		isSuccess: true,
		isFetching: false,
		refetch: vi.fn(),
	})),
}))

vi.mock('timers', () => ({
	setTimeout: vi.fn((fn) => {
		fn()
		return 1
	}),
}))

interface DndProps {
	onDragStart?: (event: { active: { id: string } }) => void
	onDragEnd?: (event: { active: { id: string }; over: { id: string } | null }) => void
	[key: string]: unknown
}

let lastDndProps: DndProps = {}

vi.mock('@dnd-kit/core', () => ({
	DndContext: ({ children, ...props }: { children: React.ReactNode } & DndProps) => {
		lastDndProps = props
		return <div data-testid="dnd-context">{children}</div>
	},
	DragOverlay: ({ children }: { children: React.ReactNode }) => <div data-testid="drag-overlay">{children}</div>,
	useSensor: vi.fn(),
	useSensors: vi.fn(),
	closestCenter: vi.fn(),
	closestCorners: vi.fn(),
	useDroppable: vi.fn(() => ({
		setNodeRef: vi.fn(),
		isOver: false,
	})),
	KeyboardSensor: vi.fn(),
	PointerSensor: vi.fn(),
	TouchSensor: vi.fn(),
	MouseSensor: vi.fn(),
}))

vi.mock('@dnd-kit/sortable', () => ({
	SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
	verticalListSortingStrategy: vi.fn(),
	useSortable: vi.fn(() => ({
		attributes: {},
		listeners: {},
		setNodeRef: vi.fn(),
		transform: { x: 0, y: 0 },
		transition: '',
		isDragging: false,
	})),
}))

vi.mock('lucide-react', () => ({
	Plus: ({ className }: { className?: string }) => <div data-testid="plus-icon" className={className} />,
	Loader2: ({ className }: { className?: string }) => <div data-testid="loader-icon" className={className} />,
	AlertCircle: ({ className }: { className?: string }) => <div data-testid="alert-circle-icon" className={className} />,
}))

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

describe('KanbanBoard', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Loading state', () => {
		it('should show loading state when tasks are loading', async () => {
			vi.mocked(taskService.getProjectTasks).mockImplementation(() => new Promise(() => { }))

			let container: HTMLElement
			await act(async () => {
				const result = render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
				container = result.container
			})

			expect(container!.querySelector('.animate-spin')).not.toBeNull()
		})
	})

	describe('Error state', () => {
		it('should show error state when tasks fail to load', async () => {
			vi.mocked(taskService.getProjectTasks).mockRejectedValue(new Error('Failed to load'))

			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			await waitFor(() => {
				expect(consoleErrorSpy).toHaveBeenCalled()
			})

			consoleErrorSpy.mockRestore()
		})
	})

	describe('Empty state', () => {
		beforeEach(() => {
			vi.mocked(taskService.getProjectTasks).mockResolvedValue([])
		})

		it('should show empty state when no tasks', async () => {
			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			const emptyStates = screen.getAllByText('Aucune tâche dans cette colonne')
			expect(emptyStates.length).toBeGreaterThanOrEqual(3)
		})

		it('should show create task button when no tasks', async () => {
			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			await waitFor(() => {
				expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument()
			})
			expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
		})
	})

	describe('Tasks display', () => {
		const mockTasks = [
			{
				id: 1,
				title: 'Task 1',
				description: 'Description 1',
				status: TaskStatus.A_FAIRE,
				priority: TaskPriority.HAUTE,
				dueDate: '2024-01-01',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				projectId: 1,
				assignedToId: 1,
				assignedTo: {
					id: 1,
					name: 'John Doe',
					email: 'john@example.com'
				}
			},
			{
				id: 2,
				title: 'Task 2',
				description: 'Description 2',
				status: TaskStatus.EN_COURS,
				priority: TaskPriority.MOYENNE,
				dueDate: '2024-01-02',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				projectId: 1,
				assignedToId: 2,
				assignedTo: {
					id: 2,
					name: 'Jane Smith',
					email: 'jane@example.com'
				}
			}
		]

		beforeEach(() => {
			vi.mocked(taskService.getProjectTasks).mockResolvedValue(mockTasks)
		})

		it('should render kanban columns', async () => {
			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			await waitFor(() => {
				expect(screen.getByText('À faire')).toBeInTheDocument()
			})
			expect(screen.getByText('En cours')).toBeInTheDocument()
			expect(screen.getByText('Terminé')).toBeInTheDocument()
		})

		it('should display tasks in correct columns', async () => {
			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			await waitFor(() => {
				expect(screen.getByText('Task 1')).toBeInTheDocument()
			})
			expect(screen.getByText('Task 2')).toBeInTheDocument()
		})

		it('should show task count in column headers', async () => {
			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			await waitFor(() => {
				expect(screen.getByText('Task 1')).toBeInTheDocument()
			})
			expect(screen.getByText('Task 2')).toBeInTheDocument()
		})

		describe('Drag and drop handlers', () => {
			beforeEach(() => {
				vi.mocked(taskService.getProjectTasks).mockResolvedValue([
					{ id: 1, title: 'Task 1', description: '', status: TaskStatus.A_FAIRE, priority: TaskPriority.MOYENNE, dueDate: undefined, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', projectId: 1, assignedToId: undefined, assignedTo: undefined },
				])
				vi.mocked(taskService.updateTask).mockResolvedValue({
					id: 1,
					title: 'Task 1',
					description: '',
					status: TaskStatus.A_FAIRE,
					priority: TaskPriority.MOYENNE,
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z',
					projectId: 1
				})
			})

			it('sets active task on drag start and shows overlay', async () => {
				await act(async () => {
					render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
				})

				await act(async () => {
					lastDndProps.onDragStart?.({ active: { id: '1' } })
				})

				const overlay = screen.getByTestId('drag-overlay')
				expect(within(overlay).getByText('Task 1')).toBeInTheDocument()
			})

			it('updates task status on drag end over a column', async () => {
				await act(async () => {
					render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
				})

				await act(async () => {
					lastDndProps.onDragEnd?.({ active: { id: '1' }, over: { id: 'column-TERMINE' } })
				})

				expect(taskService.updateTask).toHaveBeenCalledWith(1, { status: TaskStatus.TERMINE })
			})

			it('does not update on invalid status and logs error', async () => {
				const errSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
				await act(async () => {
					render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
				})

				await act(async () => {
					lastDndProps.onDragEnd?.({ active: { id: '1' }, over: { id: 'column-INVALID' } })
				})

				expect(taskService.updateTask).not.toHaveBeenCalled()
				expect(errSpy).toHaveBeenCalled()
				errSpy.mockRestore()
			})

			it('updates status when dropping over another task', async () => {
				vi.mocked(taskService.getProjectTasks).mockResolvedValueOnce([
					{ id: 1, title: 'Task 1', description: '', status: TaskStatus.A_FAIRE, priority: TaskPriority.MOYENNE, dueDate: undefined, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', projectId: 1, assignedToId: undefined, assignedTo: undefined },
					{ id: 2, title: 'Task 2', description: '', status: TaskStatus.EN_COURS, priority: TaskPriority.MOYENNE, dueDate: undefined, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', projectId: 1, assignedToId: undefined, assignedTo: undefined },
				])

				await act(async () => {
					render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
				})

				await act(async () => {
					lastDndProps.onDragEnd?.({ active: { id: '1' }, over: { id: '2' } })
				})

				expect(taskService.updateTask).toHaveBeenCalledWith(1, { status: TaskStatus.EN_COURS })
			})

			it('rolls back status if updateTask fails', async () => {
				vi.mocked(taskService.updateTask).mockRejectedValueOnce(new Error('fail'))
				const errSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

				await act(async () => {
					render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
				})

				await act(async () => {
					lastDndProps.onDragEnd?.({ active: { id: '1' }, over: { id: 'column-TERMINE' } })
				})

				expect(taskService.updateTask).toHaveBeenCalled()
				expect(errSpy).toHaveBeenCalled()
				errSpy.mockRestore()
			})
		})
	})

	describe('DnD context', () => {
		beforeEach(() => {
			vi.mocked(taskService.getProjectTasks).mockResolvedValue([])
		})

		it('should render DnD context', async () => {
			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			await waitFor(() => {
				expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
			})
		})

		it('should render sortable context', async () => {
			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			await waitFor(() => {
				const sortableContexts = screen.getAllByTestId('sortable-context')
				expect(sortableContexts.length).toBeGreaterThanOrEqual(3)
			})
		})
	})

	describe('Props handling', () => {
		beforeEach(() => {
			vi.mocked(taskService.getProjectTasks).mockResolvedValue([])
		})

		it('should call taskService with correct projectId', async () => {
			await act(async () => {
				render(<KanbanBoard projectId={123} />, { wrapper: createWrapper() })
			})

			await waitFor(() => {
				expect(taskService.getProjectTasks).toHaveBeenCalledWith(123)
			})
		})

		it('should handle task editing', async () => {
			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
		})

		it('should handle task deletion', async () => {
			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
		})
	})

	describe('Task modal create/update', () => {
		beforeEach(() => {
			vi.mocked(taskService.getProjectTasks).mockResolvedValue([])
			vi.mocked(taskService.createTask).mockResolvedValue({ id: 10, title: 'Created', status: TaskStatus.A_FAIRE, description: '', priority: TaskPriority.MOYENNE, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', projectId: 1 })
			vi.mocked(taskService.updateTask).mockResolvedValue({ id: 1, title: 'Updated', status: TaskStatus.EN_COURS, description: '', priority: TaskPriority.MOYENNE, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', projectId: 1 })
		})

		interface TaskModalProps {
			isOpen: boolean;
			onSave: (task: Partial<Task>) => void;
			onClose: () => void;
		}

		vi.mock('../../components/TaskModal.tsx', () => ({
			default: ({ isOpen, onSave, onClose }: TaskModalProps) => {
				if (isOpen) {
					return (
						<div data-testid="task-modal">
							<button data-testid="save-button" onClick={() => onSave({ title: 'New task', status: TaskStatus.A_FAIRE })}>
								Save
							</button>
							<button data-testid="close-button" onClick={onClose}>
								Close
							</button>
						</div>
					)
				}
				return null
			}
		}))

		it('should close modal when onClose is called', async () => {
			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			act(() => {
				screen.getByText('Nouvelle tâche').click()
			})

			await waitFor(() => {
				expect(screen.getByTestId('task-modal')).toBeInTheDocument()
			})

			act(() => {
				screen.getByTestId('close-button').click()
			})

			await waitFor(() => {
				expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()
			})
		})

		it('creates a task from modal', async () => {
			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			act(() => {
				screen.getByText('Nouvelle tâche').click()
			})

			await waitFor(() => {
				expect(screen.getByTestId('save-button')).toBeInTheDocument()
			})

			act(() => {
				screen.getByTestId('save-button').click()
			})

			await waitFor(() => {
				expect(taskService.createTask).toHaveBeenCalled()
			})
		})

		it('updates a task from modal when clicking a task card', async () => {
			vi.mocked(taskService.getProjectTasks).mockResolvedValueOnce([
				{ id: 1, title: 'Task 1', description: '', status: TaskStatus.A_FAIRE, priority: TaskPriority.MOYENNE, dueDate: undefined, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', projectId: 1, assignedToId: undefined, assignedTo: undefined },
			])

			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			act(() => {
				screen.getByText('Task 1').click()
			})

			await waitFor(() => {
				expect(screen.getByTestId('save-button')).toBeInTheDocument()
			})

			act(() => {
				screen.getByTestId('save-button').click()
			})

			await waitFor(() => {
				expect(taskService.updateTask).toHaveBeenCalled()
			})
		})

		it('logs error when createTask fails', async () => {
			vi.mocked(taskService.createTask).mockRejectedValueOnce(new Error('create-fail'))
			const errSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			act(() => {
				screen.getByText('Nouvelle tâche').click()
			})

			await waitFor(() => {
				expect(screen.getByTestId('save-button')).toBeInTheDocument()
			})

			act(() => {
				screen.getByTestId('save-button').click()
			})

			await waitFor(() => {
				expect(errSpy).toHaveBeenCalled()
			})
			errSpy.mockRestore()
		})

		it('logs error when updateTask fails from modal', async () => {
			vi.mocked(taskService.getProjectTasks).mockResolvedValueOnce([
				{ id: 1, title: 'Task 1', description: '', status: TaskStatus.A_FAIRE, priority: TaskPriority.MOYENNE, dueDate: undefined, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', projectId: 1, assignedToId: undefined, assignedTo: undefined },
			])
			vi.mocked(taskService.updateTask).mockRejectedValueOnce(new Error('update-fail'))
			const errSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

			await act(async () => {
				render(<KanbanBoard projectId={1} />, { wrapper: createWrapper() })
			})

			act(() => {
				screen.getByText('Task 1').click()
			})

			await waitFor(() => {
				expect(screen.getByTestId('save-button')).toBeInTheDocument()
			})

			act(() => {
				screen.getByTestId('save-button').click()
			})

			await waitFor(() => {
				expect(errSpy).toHaveBeenCalled()
			})
			errSpy.mockRestore()
		})
	})
})
