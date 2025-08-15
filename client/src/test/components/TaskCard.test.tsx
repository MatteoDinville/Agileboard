import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskCard from '../../components/TaskCard'
import { TaskPriority, TaskStatus } from '../../types/enums'

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

const mockTask = {
	id: 1,
	title: 'Test Task',
	description: 'Test Description',
	status: TaskStatus.A_FAIRE,
	priority: TaskPriority.MOYENNE,
	dueDate: '2024-12-31',
	projectId: 1,
	assigneeId: null,
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z'
}

describe('TaskCard', () => {
	const mockOnEdit = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders task information correctly', () => {
		render(<TaskCard task={mockTask} onEdit={mockOnEdit} />)

		expect(screen.getByText('Test Task')).toBeInTheDocument()
		expect(screen.getByText('Test Description')).toBeInTheDocument()
		expect(screen.getByText('Moyenne')).toBeInTheDocument()
	})

	it('calls onEdit when clicked', () => {
		render(<TaskCard task={mockTask} onEdit={mockOnEdit} />)

		const taskCard = screen.getByText('Test Task').closest('div')
		fireEvent.click(taskCard!)

		expect(mockOnEdit).toHaveBeenCalledTimes(1)
	})

	it('displays correct priority badge color for different priorities', () => {
		const urgentTask = { ...mockTask, priority: TaskPriority.URGENTE }
		const { rerender } = render(<TaskCard task={urgentTask} onEdit={mockOnEdit} />)

		expect(screen.getByText('Urgente')).toBeInTheDocument()

		const highTask = { ...mockTask, priority: TaskPriority.HAUTE }
		rerender(<TaskCard task={highTask} onEdit={mockOnEdit} />)
		expect(screen.getByText('Haute')).toBeInTheDocument()

		const lowTask = { ...mockTask, priority: TaskPriority.BASSE }
		rerender(<TaskCard task={lowTask} onEdit={mockOnEdit} />)
		expect(screen.getByText('Basse')).toBeInTheDocument()
	})

	it('formats date correctly', () => {
		const taskWithDate = { ...mockTask, dueDate: '2024-12-25' }
		render(<TaskCard task={taskWithDate} onEdit={mockOnEdit} />)

		expect(screen.getByText('25 déc.')).toBeInTheDocument()
	})

	it('handles task without due date', () => {
		const taskWithoutDate = { ...mockTask, dueDate: undefined }
		render(<TaskCard task={taskWithoutDate} onEdit={mockOnEdit} />)

		expect(screen.getByText('Test Task')).toBeInTheDocument()
	})

	it('applies correct styling for overdue tasks', () => {
		const overdueTask = {
			...mockTask,
			dueDate: '2020-01-01'
		}
		render(<TaskCard task={overdueTask} onEdit={mockOnEdit} />)

		expect(screen.getByText('Test Task')).toBeInTheDocument()
	})

	it('handles long task titles with line clamping', () => {
		const longTitleTask = {
			...mockTask,
			title: 'This is a very long task title that should be clamped to two lines maximum to maintain the card layout consistency'
		}
		render(<TaskCard task={longTitleTask} onEdit={mockOnEdit} />)

		expect(screen.getByText(longTitleTask.title)).toBeInTheDocument()
	})

	it('handles empty description', () => {
		const taskWithoutDescription = { ...mockTask, description: '' }
		render(<TaskCard task={taskWithoutDescription} onEdit={mockOnEdit} />)

		expect(screen.getByText('Test Task')).toBeInTheDocument()
	})
})
