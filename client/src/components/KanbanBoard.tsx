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
import { TaskStatus, TaskStatusLabels, TaskPriority, TaskPriorityLabels, type TaskStatusType } from '../types/enums';
import KanbanColumn from './KanbanColumn.tsx';
import TaskCard from './TaskCard.tsx';
import TaskModal from './TaskModal.tsx';
import {
	LayoutGrid,
	Table,
	Search,
	ChevronDown,
	ChevronUp,
	Calendar,
	Edit2,
	Trash2,
	Plus
} from 'lucide-react';

interface KanbanBoardProps {
	projectId: number;
}

type ViewMode = 'kanban' | 'table';
type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'assignedTo' | 'createdAt';
type SortDirection = 'asc' | 'desc';
type SortValue = string | number;

const PRIORITY_ORDER = {
	[TaskPriority.URGENTE]: 4,
	[TaskPriority.HAUTE]: 3,
	[TaskPriority.MOYENNE]: 2,
	[TaskPriority.BASSE]: 1
};

const getSortValue = (task: Task, field: SortField): SortValue => {
	switch (field) {
		case 'title':
			return task.title;
		case 'status':
			return task.status;
		case 'priority':
			return PRIORITY_ORDER[task.priority];
		case 'dueDate':
			return task.dueDate ? new Date(task.dueDate).getTime() : 0;
		case 'assignedTo':
			return task.assignedTo?.name || task.assignedTo?.email || '';
		case 'createdAt':
			return new Date(task.createdAt).getTime();
		default:
			return '';
	}
};

const compareValues = (a: SortValue, b: SortValue, direction: SortDirection): number => {
	if (direction === 'asc') {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	} else {
		if (a > b) return -1;
		if (a < b) return 1;
		return 0;
	}
};

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
	const [viewMode, setViewMode] = useState<ViewMode>('kanban');
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [priorityFilter, setPriorityFilter] = useState<string>("all");
	const [assigneeFilter] = useState<string>("all");
	const [sortField, setSortField] = useState<SortField>('createdAt');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
	const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

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

	// Fonctions pour la vue tableau
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const getSortIcon = (field: SortField) => {
		if (sortField !== field) return null;
		return sortDirection === 'asc' ?
			<ChevronUp className="w-4 h-4" /> :
			<ChevronDown className="w-4 h-4" />;
	};

	const getPriorityColor = (priority: TaskPriority) => {
		switch (priority) {
			case TaskPriority.URGENTE:
				return 'bg-red-100 text-red-800 border-red-200';
			case TaskPriority.HAUTE:
				return 'bg-orange-100 text-orange-800 border-orange-200';
			case TaskPriority.MOYENNE:
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case TaskPriority.BASSE:
				return 'bg-green-100 text-green-800 border-green-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getStatusColor = (status: TaskStatus) => {
		switch (status) {
			case TaskStatus.A_FAIRE:
				return 'bg-gray-100 text-gray-800 border-gray-200';
			case TaskStatus.EN_COURS:
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case TaskStatus.TERMINE:
				return 'bg-green-100 text-green-800 border-green-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const toggleTaskSelection = (taskId: number) => {
		setSelectedTasks(prev =>
			prev.includes(taskId)
				? prev.filter(id => id !== taskId)
				: [...prev, taskId]
		);
	};

	const toggleSelectAll = () => {
		if (selectedTasks.length === filteredAndSortedTasks.length) {
			setSelectedTasks([]);
		} else {
			setSelectedTasks(filteredAndSortedTasks.map(task => task.id));
		}
	};

	const handleDeleteSelectedTasks = async () => {
		if (selectedTasks.length === 0) return;

		if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedTasks.length} tâche(s) ?`)) {
			return;
		}

		try {
			await Promise.all(selectedTasks.map(taskId => taskService.deleteTask(taskId)));
			setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
			setSelectedTasks([]);
		} catch (error) {
			console.error("Erreur lors de la suppression des tâches:", error);
			alert("Erreur lors de la suppression des tâches");
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	};

	const filteredAndSortedTasks = React.useMemo(() => {
		if (!tasks) return [];

		const filtered = tasks.filter(task => {
			const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				task.description?.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = statusFilter === "all" || task.status === statusFilter;
			const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
			const matchesAssignee = assigneeFilter === "all" ||
				(assigneeFilter === "unassigned" && !task.assignedToId) ||
				task.assignedToId?.toString() === assigneeFilter;

			return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
		});

		return [...filtered].sort((a, b) => {
			const aValue = getSortValue(a, sortField);
			const bValue = getSortValue(b, sortField);
			return compareValues(aValue, bValue, sortDirection);
		});
	}, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, sortField, sortDirection]);

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
						{viewMode === 'kanban' ? 'Tableau Kanban' : 'Vue Tableau'}
					</h2>
					<p className="text-slate-600 mt-1">Organisez et suivez vos tâches en temps réel</p>
				</div>
				<div className="flex items-center gap-4">
					{/* Toggle entre vues */}
					<div className="flex bg-gray-100 rounded-lg p-1">
						<button
							onClick={() => setViewMode('kanban')}
							className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${viewMode === 'kanban'
								? 'bg-white text-blue-600 shadow-sm'
								: 'text-gray-600 hover:text-gray-900'
								}`}
						>
							<LayoutGrid className="w-4 h-4" />
							<span className="font-medium">Kanban</span>
						</button>
						<button
							onClick={() => setViewMode('table')}
							className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${viewMode === 'table'
								? 'bg-white text-blue-600 shadow-sm'
								: 'text-gray-600 hover:text-gray-900'
								}`}
						>
							<Table className="w-4 h-4" />
							<span className="font-medium">Tableau</span>
						</button>
					</div>

					<button
						onClick={() => openCreateModal(TaskStatus.A_FAIRE)}
						className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
					>
						<Plus className="w-4 h-4" />
						<span className="font-medium">Nouvelle tâche</span>
					</button>
				</div>
			</div>

			{viewMode === 'table' && (
				<div className="space-y-6 mb-8">
					{/* Filtres et recherche */}
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div>
								<label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
									Rechercher
								</label>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<input
										id="search-input"
										type="text"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										placeholder="Rechercher une tâche..."
										className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
							</div>

							<div>
								<label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
									Statut
								</label>
								<select
									id="status-filter"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="all">Tous les statuts</option>
									{Object.entries(TaskStatusLabels).map(([key, label]) => (
										<option key={key} value={key}>
											{label}
										</option>
									))}
								</select>
							</div>

							<div>
								<label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-2">
									Priorité
								</label>
								<select
									id="priority-filter"
									value={priorityFilter}
									onChange={(e) => setPriorityFilter(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="all">Toutes les priorités</option>
									{Object.entries(TaskPriorityLabels).map(([key, label]) => (
										<option key={key} value={key}>
											{label}
										</option>
									))}
								</select>
							</div>

							{selectedTasks.length > 0 && (
								<div className="flex items-end">
									<button
										onClick={handleDeleteSelectedTasks}
										className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
									>
										<Trash2 className="w-4 h-4" />
										Supprimer ({selectedTasks.length})
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{viewMode === 'kanban' ? (
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
			) : (
				/* Vue Tableau */
				<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left">
										<input
											type="checkbox"
											checked={selectedTasks.length === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
											onChange={toggleSelectAll}
											className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
										/>
									</th>
									<th
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
										onClick={() => handleSort('title')}
									>
										<div className="flex items-center space-x-1">
											<span>Tâche</span>
											{getSortIcon('title')}
										</div>
									</th>
									<th
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
										onClick={() => handleSort('status')}
									>
										<div className="flex items-center space-x-1">
											<span>Statut</span>
											{getSortIcon('status')}
										</div>
									</th>
									<th
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
										onClick={() => handleSort('priority')}
									>
										<div className="flex items-center space-x-1">
											<span>Priorité</span>
											{getSortIcon('priority')}
										</div>
									</th>
									<th
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
										onClick={() => handleSort('assignedTo')}
									>
										<div className="flex items-center space-x-1">
											<span>Assigné à</span>
											{getSortIcon('assignedTo')}
										</div>
									</th>
									<th
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
										onClick={() => handleSort('dueDate')}
									>
										<div className="flex items-center space-x-1">
											<span>Échéance</span>
											{getSortIcon('dueDate')}
										</div>
									</th>
									<th
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
										onClick={() => handleSort('createdAt')}
									>
										<div className="flex items-center space-x-1">
											<span>Créé le</span>
											{getSortIcon('createdAt')}
										</div>
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredAndSortedTasks.map((task) => (
									<tr key={task.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<input
												type="checkbox"
												checked={selectedTasks.includes(task.id)}
												onChange={() => toggleTaskSelection(task.id)}
												className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
											/>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{task.title}
												</div>
												{task.description && (
													<div className="text-sm text-gray-500 truncate max-w-xs">
														{task.description}
													</div>
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(task.status)}`}>
												{TaskStatusLabels[task.status]}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
												{TaskPriorityLabels[task.priority]}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{task.assignedTo ? (
												<div className="flex items-center space-x-2">
													<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
														<span className="text-xs font-medium text-white">
															{(task.assignedTo.name || task.assignedTo.email).charAt(0).toUpperCase()}
														</span>
													</div>
													<span className="text-sm text-gray-900">
														{task.assignedTo.name || task.assignedTo.email}
													</span>
												</div>
											) : (
												<span className="text-sm text-gray-400">Non assigné</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{task.dueDate ? (
												<div className="flex items-center space-x-1 text-sm text-gray-900">
													<Calendar className="w-4 h-4 text-gray-400" />
													<span>{formatDate(task.dueDate)}</span>
												</div>
											) : (
												<span className="text-sm text-gray-400">Aucune échéance</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(task.createdAt)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<button
												onClick={() => openEditModal(task)}
												className="group relative inline-flex items-center justify-center p-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
												title="Modifier la tâche"
											>
												<Edit2 className="w-4 h-4" />
												<span className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
													Modifier
												</span>
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{filteredAndSortedTasks.length === 0 && (
						<div className="text-center py-12">
							<div className="text-gray-400 text-lg mb-2">📋</div>
							<p className="text-gray-500 text-lg font-medium mb-2">Aucune tâche trouvée</p>
							<p className="text-gray-400">
								{searchTerm || statusFilter !== "all" || priorityFilter !== "all"
									? "Essayez de modifier vos filtres de recherche"
									: "Commencez par créer votre première tâche"}
							</p>
						</div>
					)}
				</div>
			)}

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
