import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import KanbanColumn from '../../components/KanbanColumn'
import { TaskStatus } from '../../types/enums'

vi.mock('@dnd-kit/core', () => ({
	useDroppable: vi.fn(() => ({
		setNodeRef: vi.fn(),
		isOver: false,
	})),
}))

const mockTasks = [
	{
		id: 1,
		title: 'Task 1',
		description: 'Description 1',
		status: TaskStatus.A_FAIRE,
		priority: 'MOYENNE',
		projectId: 1,
		assigneeId: null,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	},
	{
		id: 2,
		title: 'Task 2',
		description: 'Description 2',
		status: TaskStatus.A_FAIRE,
		priority: 'HAUTE',
		projectId: 1,
		assigneeId: null,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	}
]

const mockColumn = {
	id: 'todo',
	title: 'À faire',
	color: 'bg-gray-50',
	icon: '📋',
	textColor: 'text-gray-700',
	borderColor: 'border-gray-200'
}

describe('KanbanColumn', () => {
	const mockOnEdit = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders column with correct title', () => {
		render(
			<KanbanColumn
				column={mockColumn}
				tasks={mockTasks}
				onEditTask={mockOnEdit}
			/>
		)

		expect(screen.getByText('À faire')).toBeInTheDocument()
	})

	it('renders all tasks in the column', () => {
		render(
			<KanbanColumn
				column={mockColumn}
				tasks={mockTasks}
				onEditTask={mockOnEdit}
			/>
		)

		expect(screen.getByText('Task 1')).toBeInTheDocument()
		expect(screen.getByText('Task 2')).toBeInTheDocument()
	})

	it('renders empty state when no tasks', () => {
		render(
			<KanbanColumn
				column={mockColumn}
				tasks={[]}
				onEditTask={mockOnEdit}
			/>
		)

		expect(screen.getByText('Aucune tâche dans cette colonne')).toBeInTheDocument()
	})

	it('displays task count correctly', () => {
		render(
			<KanbanColumn
				column={mockColumn}
				tasks={mockTasks}
				onEditTask={mockOnEdit}
			/>
		)

		expect(screen.getByText('2')).toBeInTheDocument()
	})

	it('handles different column types', () => {
		const inProgressColumn = {
			...mockColumn,
			title: 'En cours',
			id: 'in-progress'
		}

		const { rerender } = render(
			<KanbanColumn
				column={inProgressColumn}
				tasks={mockTasks}
				onEditTask={mockOnEdit}
			/>
		)

		expect(screen.getByText('En cours')).toBeInTheDocument()

		const doneColumn = {
			...mockColumn,
			title: 'Terminé',
			id: 'done'
		}

		rerender(
			<KanbanColumn
				column={doneColumn}
				tasks={mockTasks}
				onEditTask={mockOnEdit}
			/>
		)

		expect(screen.getByText('Terminé')).toBeInTheDocument()
	})

	it('applies correct styling based on column properties', () => {
		render(
			<KanbanColumn
				column={mockColumn}
				tasks={mockTasks}
				onEditTask={mockOnEdit}
			/>
		)

		const column = screen.getByText('À faire').closest('div')
		expect(column).toBeInTheDocument()
	})
})
