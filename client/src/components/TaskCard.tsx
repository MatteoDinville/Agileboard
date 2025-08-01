import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../services/task';
import { TaskPriority, TaskPriorityLabels } from '../types/enums';

interface TaskCardProps {
	task: Task;
	onEdit: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
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
				return 'border-l-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-red-100';
			case TaskPriority.HAUTE:
				return 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-orange-100';
			case TaskPriority.MOYENNE:
				return 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-yellow-100';
			case TaskPriority.BASSE:
				return 'border-l-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-green-100';
			default:
				return 'border-l-slate-500 bg-gradient-to-r from-slate-50 to-slate-100 shadow-slate-100';
		}
	};

	const getPriorityBadgeColor = (priority: TaskPriority) => {
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
	}; return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={`
        bg-white rounded-xl shadow-lg border-l-4 p-5 cursor-grab
        hover:shadow-xl hover:scale-102 transition-all duration-200 backdrop-blur-sm
        ${getPriorityColor(task.priority)}
        ${isDragging ? 'opacity-30 shadow-2xl z-50' : 'active:cursor-grabbing'}
      `}
			onClick={onEdit}
		>
			<div className="flex justify-between items-start mb-3">
				<h4 className="font-semibold text-slate-800 line-clamp-2 text-base leading-relaxed">
					{task.title}
				</h4>
				<div className="flex items-center gap-2">
					<span className={`
			text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm border
			${getPriorityBadgeColor(task.priority)}
		  `}>
						{TaskPriorityLabels[task.priority]}
					</span>
				</div>
			</div>

			{task.description && (
				<p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
					{task.description}
				</p>
			)}

			<div className="flex justify-between items-center text-xs">
				<div className="flex items-center gap-3">
					{task.assignedTo && (
						<div className="flex items-center gap-2 bg-slate-50 rounded-full px-3 py-1.5">
							<div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
								{task.assignedTo.name?.[0] || task.assignedTo.email[0].toUpperCase()}
							</div>
							<span className="hidden sm:inline text-slate-700 font-medium">
								{task.assignedTo.name || task.assignedTo.email}
							</span>
						</div>
					)}				</div>

				{task.dueDate && (
					<div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full
            ${isOverdue(task.dueDate)
							? 'text-red-600 bg-red-50 border border-red-200 font-semibold'
							: 'text-slate-600 bg-slate-50 border border-slate-200'}
          `}>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<span className="font-medium">{formatDate(task.dueDate)}</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default TaskCard;
