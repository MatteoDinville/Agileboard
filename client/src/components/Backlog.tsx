import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService, type Task } from "../services/task";
import { TaskStatus, TaskPriority, TaskStatusLabels, TaskPriorityLabels } from "../types/enums";
import {
	Calendar,
	ChevronDown,
	ChevronUp,
	Search,
	Plus,
	Edit2,
	Trash2,
	Loader2,
	AlertCircle
} from "lucide-react";
import { SectionLoader } from "./Loading";

interface BacklogProps {
	projectId: number;
	onEditTask?: (task: Task) => void;
	onDeleteTask?: (taskId: number) => void;
	onCreateTask?: () => void;
}

interface AssigneeType {
	id: number;
	name?: string;
	email: string;
}

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

const Backlog: React.FC<BacklogProps> = ({
	projectId,
	onEditTask,
	onDeleteTask,
	onCreateTask
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [priorityFilter, setPriorityFilter] = useState<string>("all");
	const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
	const [sortField, setSortField] = useState<SortField>('createdAt');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
	const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
	const [isDeleting, setIsDeleting] = useState(false);

	const queryClient = useQueryClient();

	const { data: tasks, isLoading, error } = useQuery<Task[]>({
		queryKey: ["tasks", projectId],
		queryFn: () => taskService.getProjectTasks(projectId),
		enabled: !!projectId,
	}); const handleSort = (field: SortField) => {
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

		filtered.sort((a, b) => {
			const aValue = getSortValue(a, sortField);
			const bValue = getSortValue(b, sortField);
			return compareValues(aValue, bValue, sortDirection);
		});

		return filtered;
	}, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, sortField, sortDirection]);

	const uniqueAssignees = React.useMemo(() => {
		if (!tasks) return [];
		const assignees = new Map<number, AssigneeType>();
		tasks.forEach(task => {
			if (task.assignedTo) {
				assignees.set(task.assignedToId!, task.assignedTo);
			}
		});
		return Array.from(assignees.values());
	}, [tasks]);

	// Fonctions pour la gestion de la sélection
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

	const handleDeleteSelected = async () => {
		if (selectedTasks.length === 0) return;

		if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedTasks.length} tâche${selectedTasks.length > 1 ? 's' : ''} ?`)) {
			return;
		}

		setIsDeleting(true);
		try {
			// Supprimer toutes les tâches sélectionnées
			await Promise.all(selectedTasks.map(taskId => taskService.deleteTask(taskId)));

			// Réinitialiser la sélection
			setSelectedTasks([]);

			// Invalider le cache pour refetch les tâches
			await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
		} catch (error) {
			console.error('Erreur lors de la suppression des tâches:', error);
			alert('Erreur lors de la suppression des tâches');
		} finally {
			setIsDeleting(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	};

	if (isLoading) {
		return <SectionLoader label="Chargement du backlog..." minHeight={320} />;
	}

	if (error) {
		return (
			<div className="flex items-center justify-center p-12">
				<AlertCircle className="w-8 h-8 text-red-600" />
				<span className="ml-3 text-red-600">Erreur lors du chargement des tâches</span>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header avec actions */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">Backlog</h2>
					<p className="text-gray-600 mt-1">
						{filteredAndSortedTasks.length} tâche{filteredAndSortedTasks.length > 1 ? 's' : ''}
						{tasks && tasks.length !== filteredAndSortedTasks.length &&
							` sur ${tasks.length} au total`
						}
						{selectedTasks.length > 0 && (
							<span className="text-blue-600 font-medium ml-2">
								({selectedTasks.length} sélectionnée{selectedTasks.length > 1 ? 's' : ''})
							</span>
						)}
					</p>
				</div>

				<div className="flex items-center space-x-3">
					{selectedTasks.length > 0 && (
						<button
							onClick={handleDeleteSelected}
							disabled={isDeleting}
							className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isDeleting ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Trash2 className="w-4 h-4" />
							)}
							<span>
								{isDeleting ? 'Suppression...' : `Supprimer (${selectedTasks.length})`}
							</span>
						</button>
					)}

					{onCreateTask && (
						<button
							onClick={onCreateTask}
							className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
						>
							<Plus className="w-4 h-4" />
							<span>Nouvelle tâche</span>
						</button>
					)}
				</div>
			</div>

			{/* Filtres */}
			<div className="bg-white rounded-lg border border-gray-200 p-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Recherche */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Rechercher une tâche..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					{/* Filtre statut */}
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="all">Tous les statuts</option>
						{Object.entries(TaskStatusLabels).map(([key, label]) => (
							<option key={key} value={key}>{label}</option>
						))}
					</select>

					{/* Filtre priorité */}
					<select
						value={priorityFilter}
						onChange={(e) => setPriorityFilter(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="all">Toutes les priorités</option>
						{Object.entries(TaskPriorityLabels).map(([key, label]) => (
							<option key={key} value={key}>{label}</option>
						))}
					</select>

					{/* Filtre assigné */}
					<select
						value={assigneeFilter}
						onChange={(e) => setAssigneeFilter(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="all">Tous les membres</option>
						<option value="unassigned">Non assigné</option>
						{uniqueAssignees.map((assignee: AssigneeType) => (
							<option key={assignee.id} value={assignee.id.toString()}>
								{assignee.name || assignee.email}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Table */}
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
										<div className="flex items-center space-x-2 justify-end">
											{onEditTask && (
												<button
													onClick={() => onEditTask(task)}
													className="group relative inline-flex items-center justify-center p-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
													title="Modifier la tâche"
												>
													<Edit2 className="w-4 h-4" />
													<span className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
														Modifier
													</span>
												</button>
											)}
											{onDeleteTask && (
												<button
													onClick={() => onDeleteTask(task.id)}
													className="group relative inline-flex items-center justify-center p-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 hover:border-red-300 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
													title="Supprimer la tâche"
												>
													<Trash2 className="w-4 h-4" />
													<span className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
														Supprimer
													</span>
												</button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{filteredAndSortedTasks.length === 0 && (
					<div className="text-center py-12">
						<div className="text-6xl mb-4 opacity-30">📋</div>
						<p className="text-xl font-medium text-gray-500 mb-2">
							{searchTerm || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all"
								? "Aucune tâche ne correspond aux filtres"
								: "Aucune tâche dans ce projet"
							}
						</p>
						<p className="text-gray-400">
							{searchTerm || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all"
								? "Essayez de modifier les filtres pour voir plus de tâches"
								: "Commencez par créer votre première tâche"
							}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Backlog;
