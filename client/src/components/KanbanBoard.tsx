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
import TaskCard from './TaskCard.tsx';
import TaskModal from './TaskModal.tsx';

interface KanbanBoardProps {
	projectId: number;
}

const columns = [
	{
		id: TaskStatus.A_FAIRE,
		title: TaskStatusLabels.A_FAIRE,
		color: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
		icon: '📋',
		textColor: 'text-slate-700',
		borderColor: 'border-slate-300'
	},
	{
		id: TaskStatus.EN_COURS,
		title: TaskStatusLabels.EN_COURS,
		color: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200',
		icon: '🚀',
		textColor: 'text-blue-700',
		borderColor: 'border-blue-300'
	},
	{
		id: TaskStatus.TERMINE,
		title: TaskStatusLabels.TERMINE,
		color: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200',
		icon: '✅',
		textColor: 'text-green-700',
		borderColor: 'border-green-300'
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
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="p-6 bg-gradient-to-br from-slate-50 to-white">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
						Tableau Kanban
					</h2>
					<p className="text-slate-600 mt-1">Organisez et suivez vos tâches en temps réel</p>
				</div>
				<button
					onClick={() => openCreateModal(TaskStatus.A_FAIRE)}
					className="bg-blue-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
				>
					<span className="text-lg">+</span>
					<span className="font-medium">Nouvelle tâche</span>
				</button>
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
				onSave={(taskData: Partial<Task>) => {
					if (editingTask?.id) {
						const updateData: UpdateTaskData = {
							title: taskData.title,
							description: taskData.description,
							status: taskData.status,
							priority: taskData.priority,
							dueDate: taskData.dueDate,
							assignedToId: taskData.assignedToId,
						};
						handleUpdateTask(editingTask.id, updateData);
					} else {
						const createData: CreateTaskData = {
							title: taskData.title ?? "",
							description: taskData.description,
							status: taskData.status,
							priority: taskData.priority,
							dueDate: taskData.dueDate,
							assignedToId: taskData.assignedToId,
						};
						handleCreateTask(createData);
					}
				}}
				projectId={projectId}
			/>
		</div>
	);
};

export default KanbanBoard;
