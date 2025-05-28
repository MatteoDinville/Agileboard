// src/pages/ProjectDetail.jsx
import { PencilIcon, TrashIcon, UserPlusIcon, LoaderCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useParams, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { EditRoleModal } from './EditRoleModal';
import { Role } from '../../types/role';
import toast from 'react-hot-toast';

interface ProjectMember {
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	role: Role;
}

interface Project {
	id: string;
	name: string;
	description: string;
	key: string;
	members: ProjectMember[];
}

export function ProjectDetailsPage() {
	const { projectId } = useParams({ from: '/home/projects/$projectId' });
	const router = useRouter();
	const queryClient = useQueryClient();
	const [editingMember, setEditingMember] = useState<ProjectMember | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const { data: project, isLoading } = useQuery<Project>({
		queryKey: ['project', projectId],
		queryFn: () => api.get(`/projects/${projectId}`),
		enabled: !!projectId,
	});

	if (isLoading) {
		return <LoaderCircle className="w-10 h-10 animate-spin" />
	}

	if (!project) {
		return <div className="p-8">Projet non trouvé</div>;
	}

	const handleEditRole = (member: ProjectMember) => {
		setEditingMember(member);
	};

	const handleCloseEditRole = () => {
		setEditingMember(null);
	};

	const handleDeleteProject = async () => {
		if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
			return;
		}

		setIsDeleting(true);
		try {
			await api.delete(`/projects/${projectId}`);
			await queryClient.invalidateQueries({ queryKey: ['projects'] });
			toast.success('Projet supprimé avec succès');
			router.navigate({ to: '/home/projects' });
		} catch (err) {
			console.error('Error deleting project:', err);
			const message = err instanceof Error ? err.message : 'Erreur lors de la suppression du projet';
			toast.error(message);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div>
			{/* En-tête projet - Full Width Background */}
			<div className="bg-white shadow-sm border-b border-gray-200">
				<div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between">
						<div className="flex-1 min-w-0">
							<h1 className="text-3xl font-bold leading-tight text-gray-900 sm:truncate mb-2 md:mb-0">
								{project.name}
							</h1>
							<p className="mb-1 text-sm text-gray-600 max-w-2xl">{project.description}</p>
							<div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
								<span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-2 sm:mb-0">
									{project.key}
								</span>
							</div>
						</div>
						<div className="mt-5 flex md:mt-0 md:ml-4 space-x-3">
							<button
								type="button"
								className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
							>
								<PencilIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
								Modifier
							</button>
							<button
								type="button"
								onClick={handleDeleteProject}
								disabled={isDeleting}
								className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
								{isDeleting ? 'Suppression...' : 'Supprimer'}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Section Membres - Full Width Background, Contained Table Panel */}
			<div className="bg-gray-50 py-10 border-t border-gray-200">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-2xl font-semibold text-gray-900">Membres du projet</h2>
						<button
							className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 cursor-pointer"
						>
							<UserPlusIcon className="w-5 h-5 mr-2" /> Inviter un membre
						</button>
					</div>

					<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Nom
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Email
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Rôle
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{project.members.map((member) => (
									<tr key={member.user.email}>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{member.user.firstName} {member.user.lastName}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-500">{member.user.email}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${member.role === 'PRODUCT_OWNER'
													? 'bg-red-100 text-red-800'
													: member.role === 'DEVELOPER'
														? 'bg-blue-100 text-blue-800'
														: 'bg-green-100 text-green-800'
													}`}
											>
												{member.role.charAt(0) + member.role.slice(1).toLowerCase().replace('_', ' ')}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
											<button
												onClick={() => handleEditRole(member)}
												className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
												title="Modifier le rôle"
											>
												<PencilIcon className="w-5 h-5" />
												<span className="sr-only">Modifier le rôle</span>
											</button>
											<button className="text-red-500 hover:text-red-700 transition-colors cursor-pointer" title="Retirer le membre">
												<TrashIcon className="w-5 h-5" />
												<span className="sr-only">Retirer le membre</span>
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{editingMember && (
				<EditRoleModal
					isOpen={!!editingMember}
					onClose={handleCloseEditRole}
					projectId={projectId}
					memberId={editingMember.user.id}
					currentRole={editingMember.role}
					memberName={`${editingMember.user.firstName} ${editingMember.user.lastName}`}
				/>
			)}
		</div>
	);
}
