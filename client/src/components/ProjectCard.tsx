import { Link } from '@tanstack/react-router';
import { Crown, UserCheck, Edit3, Trash2, Users, Calendar, FolderOpen } from 'lucide-react';
import { useDeleteProject } from '../utils/hooks/project';
import type { Project } from '../services/project';
import toast from 'react-hot-toast';

interface ProjectCardProps {
	project: Project;
	isOwner: boolean;
	viewMode: 'grid' | 'list';
}

export function ProjectCard({ project, isOwner, viewMode }: ProjectCardProps) {
	const deleteProjectMutation = useDeleteProject();

	const getStatusColor = (status?: string) => {
		switch (status) {
			case "En cours": return { class: "bg-blue-100 text-blue-800 border-blue-200", emoji: "🚀" };
			case "Terminé": return { class: "bg-green-100 text-green-800 border-green-200", emoji: "✅" };
			case "En attente": return { class: "bg-yellow-100 text-yellow-800 border-yellow-200", emoji: "⏳" };
			default: return { class: "bg-gray-100 text-gray-800 border-gray-200", emoji: "📝" }
		}
	};

	const getPriorityColor = (priority?: string) => {
		switch (priority) {
			case "Haute": return { class: "bg-red-100 text-red-800", emoji: "🔥" };
			case "Moyenne": return { class: "bg-orange-100 text-orange-800", emoji: "⚠️" };
			case "Basse": return { class: "bg-green-100 text-green-800", emoji: "🌱" };
			default: return { class: "bg-gray-100 text-gray-800", emoji: "📊" };
		}
	};

	const handleDelete = (projectId: number) => {
		if (confirm('Voulez-vous vraiment supprimer ce projet ?')) {
			deleteProjectMutation.mutate(projectId, {
				onSuccess: () => {
					toast.success('Projet supprimé avec succès');
				},
				onError: () => {
					toast.error('Erreur lors de la suppression du projet');
				}
			});
		}
	};

	const cardStyles = isOwner
		? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200/60 shadow-amber-100/50"
		: "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/60 shadow-blue-100/50";

	const headerIcon = isOwner ? (
		<div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
			<Crown data-testid="crown-icon" className="w-4 h-4 text-white" />
		</div>
	) : (
		<div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
			<UserCheck data-testid="user-check-icon" className="w-4 h-4 text-white" />
		</div>
	);

	return (
		<div className={`${cardStyles} rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group ${viewMode === "list" ? "p-4 sm:p-6 lg:p-8" : "p-4 sm:p-6 lg:p-7"}`}>
			{viewMode === "grid" ? (
				<>
					<div className="flex items-start justify-between mb-4 sm:mb-6">
						{headerIcon}
						<div className="flex items-center space-x-1">
							<Link
								to="/projects/$projectId"
								params={{ projectId: project.id.toString() }}
								className="p-1.5 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white/80 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110"
								title="Voir les détails du projet"
							>
								<FolderOpen data-testid="folder-icon" className="w-4 h-4" />
							</Link>
							{isOwner && (
								<>
									<Link
										to="/projects/$projectId/edit"
										params={{ projectId: project.id.toString() }}
										className="p-1.5 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white/80 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110"
										title="Modifier le projet"
									>
										<Edit3 data-testid="edit-icon" className="w-4 h-4" />
									</Link>
									<button
										onClick={() => handleDelete(project.id)}
										className="p-1.5 sm:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer"
										title="Supprimer le projet"
									>
										<Trash2 data-testid="trash-icon" className="w-4 h-4" />
									</button>
								</>
							)}
						</div>
					</div>

					<div className="mb-4 sm:mb-6">
						<Link
							to="/projects/$projectId"
							params={{ projectId: project.id.toString() }}
							className="block"
						>
							<h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-200 hover:cursor-pointer line-clamp-2">
								{project.title}
							</h3>
						</Link>
						<p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
							{project.description ?? "Aucune description fournie pour ce projet"}
						</p>
					</div>

					<div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
						<span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(project.status).class}`}>
							<div className="flex items-center gap-1 sm:gap-1.5">
								<span className="text-xs sm:text-sm">{getStatusColor(project.status).emoji}</span>
								<span className="hidden sm:inline">{project.status ?? "Non défini"}</span>
							</div>
						</span>
						<span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm ${getPriorityColor(project.priority).class}`}>
							<div className="flex items-center gap-1 sm:gap-1.5">
								<span className="text-xs sm:text-sm">{getPriorityColor(project.priority).emoji}</span>
								<span className="hidden sm:inline">{project.priority ?? "Non définie"}</span>
							</div>
						</span>
						{project.members && project.members.length > 0 && (
							<span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm bg-purple-100 text-purple-800">
								<div className="flex items-center gap-1 sm:gap-1.5">
									<Users data-testid="users-icon" className="w-3 h-3" />
									<span>{project.members.length}</span>
									<span className="hidden sm:inline">membre{project.members.length > 1 ? 's' : ''}</span>
								</div>
							</span>
						)}
					</div>

					<div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-100">
						<div className="flex items-center space-x-1 sm:space-x-2 text-xs text-slate-500">
							<div className="p-1 sm:p-1.5 bg-slate-100 rounded-lg">
								<Calendar data-testid="calendar-icon" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
							</div>
							<span>Mis à jour le {new Date(project.updatedAt).toLocaleDateString('fr-FR')}</span>
						</div>
					</div>
				</>
			) : (
				<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
					<div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
						{headerIcon}
						<div className="flex-1 min-w-0">
							<Link
								to="/projects/$projectId"
								params={{ projectId: project.id.toString() }}
								className="block hover:opacity-80 transition-opacity"
							>
								<h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-200 hover:cursor-pointer line-clamp-2">
									{project.title}
								</h3>
							</Link>
							<p className="text-slate-600 text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
								{project.description ?? "Aucune description fournie pour ce projet"}
							</p>

							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
								<div className="flex flex-wrap gap-2 sm:gap-3">
									<span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(project.status).class}`}>
										<div className="flex items-center gap-1 sm:gap-1.5">
											<span className="text-xs sm:text-sm">{getStatusColor(project.status).emoji}</span>
											{project.status ?? "Non défini"}
										</div>
									</span>
									<span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm ${getPriorityColor(project.priority).class}`}>
										<div className="flex items-center gap-1 sm:gap-1.5">
											<span className="text-xs sm:text-sm">{getPriorityColor(project.priority).emoji}</span>
											{project.priority ?? "Non définie"}
										</div>
									</span>
									{project.members && project.members.length > 0 && (
										<span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm bg-purple-100 text-purple-800">
											<div className="flex items-center gap-1 sm:gap-1.5">
												<Users data-testid="users-icon" className="w-3 h-3" />
												{project.members.length} membre{project.members.length > 1 ? 's' : ''}
											</div>
										</span>
									)}
								</div>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end space-x-1 sm:space-x-0 sm:space-y-3 sm:ml-4">
						<div className="flex items-center space-x-1 sm:space-x-2 text-xs text-slate-500 order-2 sm:order-1">
							<div className="p-1 sm:p-1.5 bg-slate-100 rounded-lg">
								<Calendar data-testid="calendar-icon" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
							</div>
							<span className="font-medium">
								<span className="sm:hidden">
									{new Date(project.updatedAt).toLocaleDateString('fr-FR', {
										day: 'numeric',
										month: 'short'
									})}
								</span>
								<span className="hidden sm:inline">
									Modifié le {new Date(project.updatedAt).toLocaleDateString('fr-FR', {
										day: 'numeric',
										month: 'short',
										year: 'numeric'
									})}
								</span>
							</span>
						</div>
						<div className="flex items-center space-x-1 order-1 sm:order-2">
							<Link
								to="/projects/$projectId"
								params={{ projectId: project.id.toString() }}
								className="p-1.5 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white/80 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110"
								title="Voir les détails du projet"
							>
								<FolderOpen data-testid="folder-icon" className="w-4 h-4" />
							</Link>
							{isOwner && (
								<>
									<Link
										to="/projects/$projectId/edit"
										params={{ projectId: project.id.toString() }}
										className="p-1.5 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white/80 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110"
										title="Modifier le projet"
									>
										<Edit3 data-testid="edit-icon" className="w-4 h-4" />
									</Link>
									<button
										onClick={() => handleDelete(project.id)}
										className="p-1.5 sm:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer"
										title="Supprimer le projet"
									>
										<Trash2 data-testid="trash-icon" className="w-4 h-4" />
									</button>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}