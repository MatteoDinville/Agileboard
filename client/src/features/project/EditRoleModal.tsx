import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { Role } from '../../types/Role';
import { api } from '../../config/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface EditRoleModalProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly projectId: string;
	readonly memberId: string;
	readonly currentRole: Role;
	readonly memberName: string;
}

export function EditRoleModal({ isOpen, onClose, projectId, memberId, currentRole, memberName }: Readonly<EditRoleModalProps>) {
	const [selectedRole, setSelectedRole] = useState<Role>(currentRole);
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await api.put(`/projects/${projectId}/members/${memberId}/role`, {
				role: selectedRole
			});

			// Invalidate and refetch project data
			await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
			toast.success('Rôle mis à jour avec succès');
			onClose();
		} catch (err) {
			console.error('Error updating role:', err);
			toast.error('Erreur lors de la mise à jour du rôle');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Modifier le rôle de ${memberName}`}
			showCloseButton
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
						Rôle
					</label>
					<div className="relative">
						<select
							id="role"
							value={selectedRole}
							onChange={(e) => setSelectedRole(e.target.value as Role)}
							className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm
								focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
								hover:border-gray-400 transition-colors duration-200 ease-in-out
								disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70
								appearance-none cursor-pointer
								text-gray-700 text-sm font-medium"
							disabled={isLoading}
						>
							{Object.values(Role).map((role) => (
								<option key={role} value={role} className="py-2">
									{role === Role.USER ? 'Utilisateur' :
										role === Role.ADMIN ? 'Administrateur' :
											role === Role.PRODUCT_OWNER ? 'Product Owner' :
												role === Role.SCRUM_MASTER ? 'Scrum Master' :
													'Développeur'}
								</option>
							))}
						</select>
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
							<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
							</svg>
						</div>
					</div>
				</div>
				<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
					<button
						type="submit"
						disabled={isLoading}
						className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						{isLoading ? 'Mise à jour...' : 'Mettre à jour'}
					</button>
					<button
						type="button"
						onClick={onClose}
						disabled={isLoading}
						className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						Annuler
					</button>
				</div>
			</form>
		</Modal>
	);
}