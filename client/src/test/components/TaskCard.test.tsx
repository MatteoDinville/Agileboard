import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskCard from '../../components/TaskCard'
import { TaskPriority, TaskStatus } from '../../types/enums'
import type { Task } from '../../services/task'
import { useSortable } from '@dnd-kit/sortable'

// Mock de @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
	useSortable: vi.fn(() => ({
		attributes: {},
		listeners: {},
		setNodeRef: vi.fn(),
		transform: null,
		transition: null,
		isDragging: false,
	}))
}))

// Mock de @dnd-kit/utilities
vi.mock('@dnd-kit/utilities', () => ({
	CSS: {
		Transform: {
			toString: vi.fn(() => 'transform: none')
		}
	}
}))

const mockTask: Task = {
	id: 1,
	title: 'Test Task',
	description: 'Test Description',
	priority: TaskPriority.MOYENNE,
	status: TaskStatus.EN_COURS,
	projectId: 1,
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z'
}

const mockOnEdit = vi.fn()

describe('TaskCard', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders task information correctly', () => {
		render(
			<TaskCard
				task={mockTask}
				onEdit={mockOnEdit}
			/>
		)

		expect(screen.getByText('Test Task')).toBeInTheDocument()
		expect(screen.getByText('Test Description')).toBeInTheDocument()
		expect(screen.getByText('Moyenne')).toBeInTheDocument()
	})

	it('calls onEdit when clicked', () => {
		render(
			<TaskCard
				task={mockTask}
				onEdit={mockOnEdit}
			/>
		)

		const taskCard = screen.getByText('Test Task').closest('div')
		fireEvent.click(taskCard!)

		expect(mockOnEdit).toHaveBeenCalledTimes(1)
	})

	it('displays priority badge with correct styling', () => {
		render(
			<TaskCard
				task={mockTask}
				onEdit={mockOnEdit}
			/>
		)

		const priorityBadge = screen.getByText('Moyenne')
		expect(priorityBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
	})

	it('handles different priority levels', () => {
		const urgentTask = {
			...mockTask,
			priority: TaskPriority.URGENTE
		}

		render(
			<TaskCard
				task={urgentTask}
				onEdit={mockOnEdit}
			/>
		)

		const priorityBadge = screen.getByText('Urgente')
		expect(priorityBadge).toHaveClass('bg-red-100', 'text-red-800')
	})

	it('handles basse priority level', () => {
		const basseTask = { ...mockTask, priority: TaskPriority.BASSE }
		render(
			<TaskCard task={basseTask} onEdit={mockOnEdit} />
		)
		const priorityBadge = screen.getByText('Basse')
		expect(priorityBadge).toHaveClass('bg-green-100', 'text-green-800')
	})

	it('falls back to default styles for unknown priority', () => {
		const unknownTask = { ...mockTask, priority: 'UNKNOWN' as unknown as TaskPriority }
		const { container } = render(
			<TaskCard task={unknownTask} onEdit={mockOnEdit} />
		)
		const headerDiv = screen.getByText('Test Task').closest('div') as HTMLElement
		const badge = headerDiv.querySelector('span') as HTMLElement
		expect(badge).toHaveClass('bg-gray-100', 'text-gray-800', 'border-gray-200')
		const cardDiv = container.querySelector('div.bg-white')
		expect(cardDiv).toHaveClass('border-l-slate-500', 'from-slate-50', 'to-slate-100')
	})

	it('applies dragging styles when isDragging=true', () => {
		vi.mocked(useSortable).mockReturnValue({
			attributes: {},
			listeners: {},
			setNodeRef: vi.fn(),
			transform: null,
			transition: null,
			isDragging: true,
		} as unknown as ReturnType<typeof useSortable>)

		const { container } = render(<TaskCard task={mockTask} onEdit={mockOnEdit} />)
		const cardDiv = container.querySelector('div.bg-white') as HTMLElement
		expect(cardDiv).toHaveClass('opacity-30', 'shadow-2xl', 'z-50')
	})

	it('displays due date when available', () => {
		const taskWithDueDate = {
			...mockTask,
			dueDate: '2024-12-31T23:59:59Z'
		}

		render(
			<TaskCard
				task={taskWithDueDate}
				onEdit={mockOnEdit}
			/>
		)

		// Le format français affiche "1 janv." pour le 1er janvier (décalage fuseau horaire)
		expect(screen.getByText('1 janv.')).toBeInTheDocument()
	})

	it('handles overdue tasks', () => {
		const overdueTask = {
			...mockTask,
			dueDate: '2023-01-01T00:00:00Z' // Past date
		}

		render(
			<TaskCard
				task={overdueTask}
				onEdit={mockOnEdit}
			/>
		)

		// Le format français affiche "1 janv." pour janvier
		expect(screen.getByText('1 janv.')).toBeInTheDocument()
	})

	it('handles task without description', () => {
		const taskWithoutDescription = {
			...mockTask,
			description: undefined
		}

		render(
			<TaskCard
				task={taskWithoutDescription}
				onEdit={mockOnEdit}
			/>
		)

		expect(screen.getByText('Test Task')).toBeInTheDocument()
		expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
	})

	it('handles task without due date', () => {
		const taskWithoutDueDate = {
			...mockTask,
			dueDate: undefined
		}

		render(
			<TaskCard
				task={taskWithoutDueDate}
				onEdit={mockOnEdit}
			/>
		)

		expect(screen.getByText('Test Task')).toBeInTheDocument()
		// Should not display any date
		expect(screen.queryByText(/\d+ [a-zé]+/)).not.toBeInTheDocument()
	})

	it('applies correct priority styling', () => {
		const { rerender, container } = render(
			<TaskCard
				task={mockTask}
				onEdit={mockOnEdit}
			/>
		)

		// Le div parent du composant TaskCard porte les classes de priorité
		const cardDiv = container.querySelector('div.bg-white')
		expect(cardDiv).toHaveClass('border-l-yellow-500', 'bg-gradient-to-r', 'from-yellow-50', 'to-yellow-100')

		// Test Haute priority
		const highPriorityTask = {
			...mockTask,
			priority: TaskPriority.HAUTE
		}

		rerender(
			<TaskCard
				task={highPriorityTask}
				onEdit={mockOnEdit}
			/>
		)

		const highPriorityCard = container.querySelector('div.bg-white')
		expect(highPriorityCard).toHaveClass('border-l-orange-500', 'bg-gradient-to-r', 'from-orange-50', 'to-orange-100')
	})

	it('handles dragging state', () => {
		render(
			<TaskCard
				task={mockTask}
				onEdit={mockOnEdit}
			/>
		)

		// Le test vérifie que le composant se rend correctement
		expect(screen.getByText('Test Task')).toBeInTheDocument()
	})

	it('displays assignee information when available', () => {
		const taskWithAssignee = {
			...mockTask,
			assignedTo: {
				id: 1,
				name: 'John Doe',
				email: 'john@example.com'
			}
		}

		render(
			<TaskCard
				task={taskWithAssignee}
				onEdit={mockOnEdit}
			/>
		)

		expect(screen.getByText('John Doe')).toBeInTheDocument()
	})

	it('falls back to email when assignee name is missing and handles future due date (not overdue)', () => {
		const future = new Date()
		future.setFullYear(future.getFullYear() + 1)
		const taskAssigneeEmailOnly = {
			...mockTask,
			assignedTo: {
				id: 2,
				name: undefined as unknown as string,
				email: 'jane@example.com'
			},
			dueDate: future.toISOString()
		}

		render(<TaskCard task={taskAssigneeEmailOnly} onEdit={mockOnEdit} />)

		expect(screen.getByText('jane@example.com')).toBeInTheDocument()
	})
})
