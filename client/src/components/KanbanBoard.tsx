import React, { useState, useEffect } from 'react';
import {
	DndContext,
	type DragEndEvent,
	type DragStartEvent,
	PointerSensor,
	MouseSensor,
	useSensor,
	useSensors,
	closestCorners,
	DragOverlay,
} from '@dnd-kit/core';
import { taskService } from '../services/task';
import type { CreateTaskData, Task, UpdateTaskData } from '../services/task';
import { TaskStatus, TaskStatusLabels, type TaskStatusType } from '../types/enums';
import KanbanColumn from './KanbanColumn.tsx';
import { SectionLoader } from './Loading';
import TaskCard from './TaskCard.tsx';
import TaskModal from './TaskModal.tsx';
import {
	Plus
} from 'lucide-react';

interface KanbanBoardProps {
	projectId: number;
}

const columns = [
	{
		id: TaskStatus.A_FAIRE,
		title: TaskStatusLabels.A_FAIRE,
		color: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 dark:bg-gray-900 dark:bg-none',
		icon: '📋',
		textColor: 'text-slate-700 dark:text-slate-300',
		borderColor: 'border-slate-300 dark:border-slate-700',
		countBg: 'bg-slate-100 dark:bg-slate-900/40'
	},
	{
		id: TaskStatus.EN_COURS,
		title: TaskStatusLabels.EN_COURS,
		color: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 dark:bg-gray-900 dark:bg-none',
		icon: '🚀',
		textColor: 'text-blue-700 dark:text-blue-300',
		borderColor: 'border-blue-300 dark:border-blue-800',
		countBg: 'bg-blue-100 dark:bg-blue-900/40'
	},
	{
		id: TaskStatus.TERMINE,
		title: TaskStatusLabels.TERMINE,
		color: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 dark:bg-gray-900 dark:bg-none',
		icon: '✅',
		textColor: 'text-green-700 dark:text-green-300',
		borderColor: 'border-green-300 dark:border-green-800',
		countBg: 'bg-green-100 dark:bg-green-900/40'
	},
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 3,
			},
		}),
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 3,
			},
		})
	);

	const loadTasks = React.useCallback(async () => {
		try {
			setLoading(true);
			const data = await taskService.getProjectTasks(projectId);
			setTasks(data);
		} catch (error) {
			console.error('Erreur lors du chargement des tâches:', error);
		} finally {
			setLoading(false);
		}
	}, [projectId]);

	useEffect(() => {
		loadTasks();
	}, [loadTasks]);

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const task = tasks.find(t => t.id === Number(active.id));
		setActiveTask(task || null);
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveTask(null);

		if (!over) return;

		const taskId = Number(active.id);
		let newStatus: TaskStatusType;

		if (String(over.id).startsWith('column-')) {
			newStatus = String(over.id).replace('column-', '') as TaskStatusType;
		} else {
			const targetTask = tasks.find(t => t.id === Number(over.id));
			if (!targetTask) return;
			newStatus = targetTask.status;
		}

		const task = tasks.find(t => t.id === taskId);
		if (!task || task.status === newStatus) return;

		if (!Object.values(TaskStatus).includes(newStatus)) {
			console.error('Statut invalide:', newStatus);
			return;
		}

		setTasks(prev => prev.map(t =>
			t.id === taskId ? { ...t, status: newStatus } : t
		));

		try {
			await taskService.updateTask(taskId, { status: newStatus });
		} catch (error) {
			console.error('Erreur lors de la mise à jour:', error);
			setTasks(prev => prev.map(t =>
				t.id === taskId ? { ...t, status: task.status } : t
			));
		}
	};

	const handleCreateTask = async (taskData: CreateTaskData) => {
		try {
			const newTask = await taskService.createTask(projectId, taskData);
			setTasks(prev => [...prev, newTask]);
			setIsModalOpen(false);
		} catch (error) {
			console.error('Erreur lors de la création de la tâche:', error);
		}
	};

	const handleUpdateTask = async (taskId: number, taskData: UpdateTaskData) => {
		try {
			const updatedTask = await taskService.updateTask(taskId, taskData);
			setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
			setIsModalOpen(false);
			setEditingTask(null);
		} catch (error) {
			console.error('Erreur lors de la mise à jour de la tâche:', error);
		}
	};

	const openCreateModal = (status: TaskStatusType) => {
		setEditingTask({ status } as Task);
		setIsModalOpen(true);
	};

	const openEditModal = (task: Task) => {
		setEditingTask(task);
		setIsModalOpen(true);
	};

	if (loading) {
		return <SectionLoader label="Chargement du Kanban..." minHeight={320} />;
	}

	return (
		<div className="p-6 bg-gradient-to-br from-slate-50 to-white dark:bg-gray-900 dark:bg-none">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
				<div>
					<h2 className="text-2xl sm:text-3xl font-bold">
						<span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent dark:hidden">
							Tableau Kanban
						</span>
						<span className="hidden dark:inline text-gray-100">Tableau Kanban</span>
					</h2>
					<p className="text-slate-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Organisez et suivez vos tâches en temps réel</p>
				</div>
				<div className="flex items-center justify-center sm:justify-end">
					<button
						onClick={() => openCreateModal(TaskStatus.A_FAIRE)}
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 sm:gap-3 shadow-lg dark:shadow-black/20 hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer w-full sm:w-auto"
					>
						<Plus className="w-4 h-4 sm:w-5 sm:h-5" />
						<span className="font-medium text-sm sm:text-base">Nouvelle tâche</span>
					</button>
				</div>
			</div>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{columns.map(column => {
						const columnTasks = tasks.filter(task => task.status === column.id);
						return (
							<KanbanColumn
								key={column.id}
								column={column}
								tasks={columnTasks}
								onEditTask={openEditModal}
							/>
						);
					})}
				</div>

				<DragOverlay>
					{activeTask ? (
						<div className="transform rotate-2 scale-105 opacity-95 shadow-2xl">
							<TaskCard task={activeTask} onEdit={() => { }} />
						</div>
					) : null}
				</DragOverlay>
			</DndContext>

			<TaskModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingTask(null);
				}}
				task={editingTask}
				onSave={async (taskData: Partial<Task>) => {
					if (editingTask?.id) {
						const updateData: UpdateTaskData = {
							title: taskData.title,
							description: taskData.description,
							status: taskData.status,
							priority: taskData.priority,
							dueDate: taskData.dueDate,
							assignedToId: taskData.assignedToId,
						};
						await handleUpdateTask(editingTask.id, updateData);
					} else {
						const createData: CreateTaskData = {
							title: taskData.title ?? "",
							description: taskData.description,
							status: taskData.status,
							priority: taskData.priority,
							dueDate: taskData.dueDate,
							assignedToId: taskData.assignedToId,
						};
						await handleCreateTask(createData);
					}
				}}
				projectId={projectId}
			/>
		</div>
	);
};

export default KanbanBoard;
