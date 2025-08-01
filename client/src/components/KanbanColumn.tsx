import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard.tsx';
import type { Task } from '../services/task';

interface Column {
	id: string;
	title: string;
	color: string;
	icon: string;
	textColor: string;
	borderColor: string;
}

interface KanbanColumnProps {
	column: Column;
	tasks: Task[];
	onCreateTask: () => void;
	onEditTask: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
	column,
	tasks,
	onCreateTask,
	onEditTask,
}) => {
	const { setNodeRef, isOver } = useDroppable({
		id: column.id,
	}); return (
		<div className={`${column.color} border-2 ${column.borderColor} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[500px]`}>
			{/* Header fixe */}
			<div className="flex justify-between items-center p-6 pb-4 flex-shrink-0">
				<div className="flex items-center gap-3">
					<span className="text-2xl">{column.icon}</span>
					<div>
						<h3 className={`font-bold text-lg ${column.textColor}`}>
							{column.title}
						</h3>
						<div className="flex items-center gap-2 mt-1">
							<span className={`${column.textColor} opacity-70 text-sm font-medium`}>
								{tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
							</span>
							<div className={`w-6 h-6 ${column.textColor.replace('text-', 'bg-').replace('-700', '-100')} rounded-full flex items-center justify-center`}>
								<span className={`text-xs font-bold ${column.textColor}`}>
									{tasks.length}
								</span>
							</div>
						</div>
					</div>
				</div>
				<button
					onClick={onCreateTask}
					className={`${column.textColor} hover:${column.textColor.replace('-700', '-800')} text-2xl font-bold p-2 rounded-lg hover:bg-white/30 transition-all duration-200 transform hover:scale-110`}
					title="Ajouter une tâche"
				>
					+
				</button>
			</div>{/* Zone de contenu scrollable */}
			<div
				ref={setNodeRef}
				className={`flex-1 overflow-y-auto px-6 pb-6 space-y-4 transition-all duration-300 rounded-xl kanban-column-scroll ${isOver
					? `${column.color.replace('from-', 'from-').replace('to-', 'to-')} ring-4 ${column.borderColor.replace('border-', 'ring-')} ring-opacity-50`
					: ''
					}`}
			><SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
					{tasks.map(task => (
						<TaskCard
							key={task.id}
							task={task}
							onEdit={() => onEditTask(task)}
						/>
					))}
				</SortableContext>

				{tasks.length === 0 && (
					<div className="text-center py-12 flex flex-col items-center justify-center h-full">
						<div className="text-6xl mb-4 opacity-30">{column.icon}</div>
						<p className={`${column.textColor} opacity-60 font-medium mb-4`}>
							Aucune tâche dans cette colonne
						</p>
						<button
							onClick={onCreateTask}
							className={`${column.textColor} hover:${column.textColor.replace('-700', '-800')} font-medium text-sm bg-white/40 hover:bg-white/60 px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm`}
						>
							+ Créer une tâche
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default KanbanColumn;
