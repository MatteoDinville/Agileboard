import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../services/task';
import { TaskPriority, TaskPriorityLabels } from '../types/enums';
import { useAuth } from '../contexts/AuthContext';

interface TaskCardProps {
	task: Task;
	onEdit: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
	const { user } = useAuth();
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: task.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};
	const getPriorityColor = (priority: TaskPriority) => {
		switch (priority) {
			case TaskPriority.URGENTE:
				return 'border-l-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-red-100 dark:bg-gray-900 dark:bg-none dark:shadow-black/10';
			case TaskPriority.HAUTE:
				return 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-orange-100 dark:bg-gray-900 dark:bg-none dark:shadow-black/10';
			case TaskPriority.MOYENNE:
				return 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-yellow-100 dark:bg-gray-900 dark:bg-none dark:shadow-black/10';
			case TaskPriority.BASSE:
				return 'border-l-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-green-100 dark:bg-gray-900 dark:bg-none dark:shadow-black/10';
			default:
				return 'border-l-slate-500 bg-gradient-to-r from-slate-50 to-slate-100 shadow-slate-100 dark:bg-gray-900 dark:bg-none dark:shadow-black/10';
		}
	};

	const getPriorityBadgeColor = (priority: TaskPriority) => {
		switch (priority) {
			case TaskPriority.URGENTE:
				return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
			case TaskPriority.HAUTE:
				return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
			case TaskPriority.MOYENNE:
				return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
			case TaskPriority.BASSE:
				return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return null;
		const date = new Date(dateString);
		return date.toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
		});
	};

	const isOverdue = (dueDate?: string) => {
		if (!dueDate) return false;
		return new Date(dueDate) < new Date();
	};

	const formattedDate = formatDate(task.dueDate);
	const overdue = isOverdue(task.dueDate);
	const isSelf = !!user && task.assignedToId === user.id;
	const stop = (e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); };

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={`
				group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md
				border border-gray-200 dark:border-gray-700 p-3 cursor-grab transition-all duration-200
				hover:scale-[1.01] hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-gray-600
				${getPriorityColor(task.priority)}
				${overdue ? 'ring-1 ring-red-300/50 dark:ring-red-500/50' : ''}
				${isDragging ? 'opacity-50 shadow-lg scale-105 z-50 rotate-1' : 'active:cursor-grabbing'}
			`}
			onClick={onEdit}
		>
			{/* Header compact */}
			<div className="flex items-start justify-between gap-2 mb-2">
				<div className="flex-1 min-w-0">
					<h4 className="font-semibold text-gray-900 dark:text-white text-xs leading-tight line-clamp-2 mb-1.5">
						{task.title}
					</h4>
					{/* Badge de priorité compact */}
					<span className={`
						inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium
						${getPriorityBadgeColor(task.priority)}
					`}>
						<div className="w-1 h-1 rounded-full bg-current mr-1"></div>
						{TaskPriorityLabels[task.priority]}
					</span>
				</div>

				<button
					onClick={(e) => { stop(e); onEdit(); }}
					title="Modifier"
					className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md
							 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400
							 cursor-pointer"
				>
					<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
					</svg>
				</button>
			</div>

			{task.description && (
				<p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-1 mb-2 leading-relaxed">
					{task.description}
				</p>
			)}

			<div className="flex items-center justify-between text-[10px]">
				<div className="flex items-center">
					{task.assignedTo ? (
						<div className={`flex items-center gap-1.5 px-2 py-1 rounded-md group/user
										${isSelf
								? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
								: 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'}`}
							title={task.assignedTo.name || task.assignedTo.email}
						>
							<div
								className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[8px] font-bold
										${isSelf ? 'bg-blue-500' : 'bg-gray-400'}`}
							>
								{task.assignedTo.name?.[0] || task.assignedTo.email[0].toUpperCase()}
							</div>
							<span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[80px] relative">
								{isSelf ? 'Moi' : (task.assignedTo.name || task.assignedTo.email.split('@')[0])}
								{/* Tooltip pour le nom complet au survol */}
								{!isSelf && (task.assignedTo.name || task.assignedTo.email).length > 12 && (
									<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1
													bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px]
													rounded-md opacity-0 group-hover/user:opacity-100 transition-opacity
													duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
										{task.assignedTo.name || task.assignedTo.email}
										{/* Petite flèche */}
										<div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0
														border-l-2 border-r-2 border-t-2 border-transparent
														border-t-gray-900 dark:border-t-gray-100"></div>
									</div>
								)}
							</span>
						</div>
					) : (
						<div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50/50 dark:bg-gray-700/30 border border-dashed border-gray-300 dark:border-gray-600">
							<div className="w-5 h-5 rounded-md bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
								<svg className="w-2 h-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-6 8a6 6 0 0112 0v1H4v-1a6 6 0 016-6z" />
								</svg>
							</div>
							<span className="text-gray-500 dark:text-gray-400 font-medium">Non assignée</span>
						</div>
					)}
				</div>

				{formattedDate && (
					<div className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium
									${overdue
							? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20'
							: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50'}`}>
						<svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<span>{formattedDate}</span>
						{overdue && <span className="text-red-600">!</span>}
					</div>
				)}
			</div>
		</div>
	);
};

export default TaskCard;
