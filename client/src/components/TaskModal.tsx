import React, { useState, useEffect } from 'react';
import type { Task } from '../services/task';
import { fetchProjectMembers } from '../services/project';

interface TaskModalProps {
	isOpen: boolean;
	onClose: () => void;
	task?: Task | null;
	onSave: (taskData: Partial<Task>) => void;
	projectId: number;
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
	onSave,
	projectId,
}) => {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		status: 'À faire',
		priority: 'Moyenne',
		dueDate: '',
		assignedToId: '',
	}); const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	useEffect(() => {
		if (task?.id) {
			// Mode édition : utiliser les données de la tâche existante
			setFormData({
				title: task.title || '',
				description: task.description || '',
				status: task.status || 'À faire',
				priority: task.priority || 'Moyenne',
				dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
				assignedToId: task.assignedToId?.toString() || '',
			});
		} else if (task?.status) {
			// Mode création avec statut spécifique : utiliser le statut fourni
			setFormData({
				title: '',
				description: '',
				status: task.status,
				priority: 'Moyenne',
				dueDate: '',
				assignedToId: '',
			});
		} else {
			// Mode création par défaut
			setFormData({
				title: '',
				description: '',
				status: 'À faire',
				priority: 'Moyenne',
				dueDate: '',
				assignedToId: '',
			});
		}
		// Réinitialiser le loading quand le modal s'ouvre
		setIsLoading(false);
	}, [task, isOpen]);

	useEffect(() => {
		if (isOpen) {
			loadUsers();
		}
	}, [isOpen]);
	const loadUsers = async () => {
		try {
			const projectMembers = await fetchProjectMembers(projectId);
			// Extraire les utilisateurs des membres du projet
			const memberUsers = projectMembers.map(member => ({
				id: member.user.id,
				email: member.user.email,
				name: member.user.name
			}));
			setUsers(memberUsers);
		} catch (error) {
			console.error('Erreur lors du chargement des membres du projet:', error);
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
				assignedToId: formData.assignedToId ? Number(formData.assignedToId) : undefined,
				projectId,
			};

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
		<div className="fixed inset-0 bg-[#00000063] bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold">
						{task?.id ? 'Modifier la tâche' : 'Nouvelle tâche'}
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Titre *
						</label>
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Titre de la tâche"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Description de la tâche"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Statut
							</label>
							<select
								name="status"
								value={formData.status}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="À faire">À faire</option>
								<option value="En cours">En cours</option>
								<option value="Terminé">Terminé</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Priorité
							</label>
							<select
								name="priority"
								value={formData.priority}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="Basse">Basse</option>
								<option value="Moyenne">Moyenne</option>
								<option value="Haute">Haute</option>
								<option value="Urgente">Urgente</option>
							</select>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Date d'échéance
						</label>
						<input
							type="date"
							name="dueDate"
							value={formData.dueDate}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Assigné à
						</label>
						<select
							name="assignedToId"
							value={formData.assignedToId}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Aucun utilisateur</option>
							{users.map(user => (
								<option key={user.id} value={user.id}>
									{user.name || user.email}
								</option>
							))}
						</select>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
						>
							Annuler
						</button>
						<button
							type="submit"
							disabled={isLoading}
							className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{isLoading ? (
								<>
									<svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									{task?.id ? 'Modification en cours...' : 'Création en cours...'}
								</>
							) : (
								task?.id ? 'Modifier' : 'Créer'
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default TaskModal;
