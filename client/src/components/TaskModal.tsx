import React, { useState, useEffect } from 'react';
import type { Task } from '../services/task';
import { projectService } from '../services/project';
import { TaskStatus, TaskPriority, TaskStatusLabels, TaskPriorityLabels, type TaskStatusType, type TaskPriorityType } from '../types/enums';
import { useAuth } from '../contexts/AuthContext';

interface TaskModalProps {
	isOpen: boolean;
	onClose: () => void;
	task?: Task | null;
	projectId: number;
	onSave: (taskData: Partial<Task>) => void;
}

interface User {
	id: number;
	email: string;
	name?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
	isOpen,
	onClose,
	task,
	projectId,
	onSave,
}) => {
	const { user } = useAuth();
	const [formData, setFormData] = useState<{
		title: string;
		description: string;
		status: TaskStatusType;
		priority: TaskPriorityType;
		dueDate: string;
		assignedToId: string;
	}>({
		title: '',
		description: '',
		status: TaskStatus.A_FAIRE,
		priority: TaskPriority.MOYENNE,
		dueDate: '',
		assignedToId: '',
	});

	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	useEffect(() => {
		if (task?.id) {
			setFormData({
				title: task.title || '',
				description: task.description || '',
				status: task.status || TaskStatus.A_FAIRE,
				priority: task.priority || TaskPriority.MOYENNE,
				dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
				assignedToId: task.assignedToId?.toString() || '',
			});
		} else if (task?.status) {
			setFormData({
				title: '',
				description: '',
				status: task.status,
				priority: TaskPriority.MOYENNE,
				dueDate: '',
				assignedToId: '',
			});
		} else {
			setFormData({
				title: '',
				description: '',
				status: TaskStatus.A_FAIRE,
				priority: TaskPriority.MOYENNE,
				dueDate: '',
				assignedToId: '',
			});
		}
		setIsLoading(false);
	}, [task, isOpen]);

	const loadUsers = React.useCallback(async () => {
		try {
			const projectMembers = await projectService.fetchProjectMembers(projectId);
			const memberUsers = projectMembers.map(member => ({
				id: member.user.id,
				email: member.user.email,
				name: member.user.name
			}));
			setUsers(memberUsers);
		} catch (error) {
			console.error('Erreur lors du chargement des membres du projet:', error);
		}
	}, [projectId]);

	useEffect(() => {
		if (isOpen) {
			loadUsers();
		}
	}, [isOpen, loadUsers]);

	const isSelfAssigned = !!user && formData.assignedToId === String(user.id);

	const handleSelfAssignToggle = () => {
		if (!user?.id) return;
		if (isSelfAssigned) {
			setFormData(prev => ({ ...prev, assignedToId: '' }));
		} else {
			setFormData(prev => ({ ...prev, assignedToId: String(user.id) }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const taskData: Partial<Task> = {
				title: formData.title,
				description: formData.description || undefined,
				status: formData.status,
				priority: formData.priority,
				dueDate: formData.dueDate || undefined,
				projectId,
			};

			if (formData.assignedToId) {
				taskData.assignedToId = Number(formData.assignedToId);
			} else {
				taskData.assignedToId = undefined;
			}

			await onSave(taskData);
		} catch (error) {
			console.error('Erreur lors de la sauvegarde:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-black/30 w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all">
				<div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:bg-blue-700 dark:bg-none px-8 py-6">
					<div className="flex justify-between items-center">
						<div>
							<h3 className="text-xl font-bold text-white">
								{task?.id ? 'Modifier la tâche' : 'Nouvelle tâche'}
							</h3>
							<p className="text-blue-100 text-sm mt-1">
								{task?.id ? 'Apportez des modifications à votre tâche' : 'Créez une nouvelle tâche pour votre projet'}
							</p>
						</div>
						<button
							onClick={onClose}
							className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200 cursor-pointer"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				<div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
					<form onSubmit={handleSubmit} className="space-y-6">{/* Titre */}
						<div className="space-y-2">
							<label htmlFor="task-title" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
								Titre de la tâche <span className="text-red-500">*</span>
							</label>
							<input
								id="task-title"
								type="text"
								name="title"
								value={formData.title}
								onChange={handleChange}
								required
								className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800"
								placeholder="Ex: Implémenter la fonctionnalité de connexion"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="task-description" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
								Description
							</label>
							<textarea
								id="task-description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								rows={4}
								className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none bg-white dark:bg-gray-800"
								placeholder="Décrivez les détails de cette tâche..."
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label htmlFor="task-status" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
									Statut
								</label>
								<div className="relative">
									<select
										id="task-status"
										name="status"
										value={formData.status}
										onChange={handleChange}
										className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 appearance-none bg-white dark:bg-gray-800 cursor-pointer"
									>
										<option value={TaskStatus.A_FAIRE}>{TaskStatusLabels.A_FAIRE}</option>
										<option value={TaskStatus.EN_COURS}>{TaskStatusLabels.EN_COURS}</option>
										<option value={TaskStatus.TERMINE}>{TaskStatusLabels.TERMINE}</option>
									</select>
									<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
										<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</div>
								</div>
								<div className="mt-3">
									<p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Déplacement rapide :</p>
									<div className="flex gap-2">
										{Object.values(TaskStatus).map((status) => {
											const isCurrentStatus = formData.status === status;
											const getStatusIcon = (status: string) => {
												switch (status) {
													case TaskStatus.A_FAIRE: return '📋';
													case TaskStatus.EN_COURS: return '🚀';
													case TaskStatus.TERMINE: return '✅';
													default: return '📋';
												}
											};

											const getStatusColor = (status: string) => {
												switch (status) {
													case TaskStatus.A_FAIRE: return 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-slate-300';
													case TaskStatus.EN_COURS: return 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:border-blue-600 dark:text-blue-300';
													case TaskStatus.TERMINE: return 'bg-green-100 hover:bg-green-200 border-green-300 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:border-green-600 dark:text-green-300';
													default: return 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700';
												}
											};

											return (
												<button
													key={status}
													type="button"
													onClick={() => setFormData(prev => ({ ...prev, status }))}
													disabled={isCurrentStatus}
													className={`
														flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-medium transition-all duration-200
														${isCurrentStatus
															? 'opacity-50 cursor-not-allowed ring-2 ring-blue-500/50'
															: 'cursor-pointer hover:scale-105 transform'
														}
														${getStatusColor(status)}
													`}
													title={`Déplacer vers ${TaskStatusLabels[status as keyof typeof TaskStatusLabels]}`}
												>
													<span className="text-sm">{getStatusIcon(status)}</span>
													<span className="hidden sm:inline">{TaskStatusLabels[status as keyof typeof TaskStatusLabels]}</span>
													{isCurrentStatus && (
														<svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
															<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
														</svg>
													)}
												</button>
											);
										})}
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<label htmlFor="task-priority" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
									Priorité
								</label>
								<div className="relative">
									<select
										id="task-priority"
										name="priority"
										value={formData.priority}
										onChange={handleChange}
										className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 appearance-none bg-white dark:bg-gray-800 cursor-pointer"
									>
										<option value={TaskPriority.BASSE}>{TaskPriorityLabels.BASSE}</option>
										<option value={TaskPriority.MOYENNE}>{TaskPriorityLabels.MOYENNE}</option>
										<option value={TaskPriority.HAUTE}>{TaskPriorityLabels.HAUTE}</option>
										<option value={TaskPriority.URGENTE}>{TaskPriorityLabels.URGENTE}</option>
									</select>
									<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
										<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</div>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label htmlFor="task-dueDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
									Date d'échéance
								</label>
								<input
									id="task-dueDate"
									type="date"
									name="dueDate"
									value={formData.dueDate}
									onChange={handleChange}
									className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 cursor-pointer"
								/>
							</div>

							<div className="space-y-2">
								<label htmlFor="task-assignedToId" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
									<div className="flex items-center justify-between gap-3">
										<span>Assigné à</span>
										{user && (
											<div className="flex items-center gap-2">
												<label className="inline-flex items-center gap-2 cursor-pointer" title={"M'assigner cette tâche"}>
													<input
														type="checkbox"
														checked={isSelfAssigned}
														onChange={handleSelfAssignToggle}
														disabled={isLoading || !user}
														role="switch"
														aria-checked={isSelfAssigned}
														className="sr-only"
													/>
													<span
														className={`relative inline-block w-10 h-6 rounded-full transition-colors ${isSelfAssigned ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
													>
														<span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isSelfAssigned ? 'translate-x-4' : ''}`}></span>
													</span>
													<span className="text-xs text-gray-700 dark:text-gray-300">M'assigner à cette tâche</span>
												</label>
											</div>
										)}
									</div>
								</label>
								<div className="relative">
									<select
										id="task-assignedToId"
										name="assignedToId"
										value={formData.assignedToId}
										onChange={handleChange}
										className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 appearance-none bg-white dark:bg-gray-800 cursor-pointer border-gray-300 dark:border-gray-700`}
									>
										<option value="">Aucun utilisateur</option>
										{user && !users.some(u => u.id === user.id) && (
											<option value={user.id}>Vous ({user.name || user.email})</option>
										)}
										{users.map(user => (
											<option key={user.id} value={user.id}>
												{user.name || user.email}
											</option>
										))}
									</select>
									<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
										<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</div>
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
							<button
								type="button"
								onClick={onClose}
								className="px-6 py-3 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 cursor-pointer"
							>
								Annuler
							</button>
							<button
								type="submit"
								disabled={isLoading || !formData.title.trim()}
								className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:bg-blue-700 dark:bg-none text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all duration-200 font-medium shadow-lg dark:shadow-black/20 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105"
							>
								{isLoading ? (
									<>
										<svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										{task?.id ? 'Modification...' : 'Création...'}
									</>
								) : (
									<div className='flex items-center gap-2 cursor-pointer'>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										{task?.id ? 'Modifier' : 'Créer'}
									</div>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default TaskModal;
