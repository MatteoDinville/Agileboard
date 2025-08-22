import { Calendar, Check, Crown, Edit3, FolderOpen, Trash2, UserCheck, Users } from "lucide-react";
import { Project } from "../services/project";
import { useDeleteProject } from "../utils/hooks/project";
import { Link } from "@tanstack/react-router";
import toast from "react-hot-toast";

export const ProjectCard = ({ viewMode, project, isOwner }: { viewMode: 'grid' | 'list', project: Project; isOwner: boolean }) => {
	const deleteMutation = useDeleteProject();

	const handleDelete = (id: number) => {
		try {
			if (confirm("Voulez-vous vraiment supprimer ce projet ?")) {
				deleteMutation.mutate(id);
				toast.success("Projet supprimé avec succès !", {
					icon: <Check className="text-green-500 w-4 h-4" />,
					duration: 5000,
					style: {
						background: '#DCFCE7',
					},
				});
			}
		} catch {
			toast.error("Erreur lors de la suppression du projet");
		}
	};

	const getStatusColor = (status?: string) => {
		switch (status) {
			case "En cours": return { class: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600/30", emoji: "🚀" };
			case "Terminé": return { class: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600/30", emoji: "✅" };
			case "En attente": return { class: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600/30", emoji: "⏳" };
			default: return { class: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600", emoji: "📝" }
		}
	};

	const getPriorityColor = (priority?: string) => {
		switch (priority) {
			case "Haute": return { class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", emoji: "🔥" };
			case "Moyenne": return { class: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", emoji: "⚠️" };
			case "Basse": return { class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", emoji: "🌱" };
			default: return { class: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", emoji: "📊" };
		}
	};

	const cardStyles = isOwner
		? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200/60 shadow-amber-100/50"
		: "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/60 shadow-blue-100/50";

	const headerIcon = isOwner ? (
		<div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-yellow-500 dark:bg-none dark:bg-amber-500/20 dark:border dark:border-amber-400/30 rounded-lg flex items-center justify-center shadow-lg dark:shadow-amber-500/10">
			<Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-amber-300" />
		</div>
	) : (
		<div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-indigo-500 dark:bg-none dark:bg-blue-500/20 dark:border dark:border-blue-400/30 rounded-lg flex items-center justify-center shadow-lg dark:shadow-blue-500/10">
			<UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-blue-300" />
		</div>
	);

	const titleColorClass = isOwner
		? "text-slate-800 hover:text-amber-600 dark:text-white dark:hover:text-amber-400"
		: "text-slate-800 hover:text-blue-600 dark:text-white dark:hover:text-blue-400";

	// Mode Grille
	if (viewMode === "grid") {
		return (
			<article className={`${cardStyles} dark:bg-gray-900 dark:[background-image:none] dark:border-gray-800 dark:ring-1 dark:ring-gray-800 dark:shadow-black/20 rounded-2xl shadow-xl hover:shadow-2xl dark:hover:shadow-gray-900/40 hover:scale-[1.02] transition-all duration-300 group p-4 sm:p-6 lg:p-7`}>
				<div className="flex items-start justify-between mb-4 sm:mb-6">
					{headerIcon}
					<div className="flex items-center space-x-1">
						<Link
							to="/projects/$projectId"
							params={{ projectId: project.id.toString() }}
							className="p-1 sm:p-1.5 lg:p-2.5 text-slate-400 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/80 dark:hover:bg-gray-800 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
							title="Voir les détails du projet"
							aria-label={`Voir les détails du projet ${project.title}`}
						>
							<FolderOpen className="w-3 h-3 sm:w-4 sm:h-4" />
						</Link>
						{isOwner && (
							<>
								<Link
									to="/projects/$projectId/edit"
									params={{ projectId: project.id.toString() }}
									className="p-1 sm:p-1.5 lg:p-2.5 text-slate-400 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/80 dark:hover:bg-gray-800 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
									title="Modifier le projet"
									aria-label={`Modifier le projet ${project.title}`}
								>
									<Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
								</Link>
								<button
									onClick={() => handleDelete(project.id)}
									className="p-1 sm:p-1.5 lg:p-2.5 text-slate-400 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
									title="Supprimer le projet"
									aria-label={`Supprimer le projet ${project.title}`}
								>
									<Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
								</button>
							</>
						)}
					</div>
				</div>

				<div className="mb-4 sm:mb-6">
					<Link
						to="/projects/$projectId"
						params={{ projectId: project.id.toString() }}
						className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg"
					>
						<h3 className={`text-lg sm:text-xl font-bold mb-2 ${titleColorClass} hover:bg-clip-text transition-all duration-200 hover:cursor-pointer line-clamp-2`}>
							{project.title}
						</h3>
					</Link>
					<p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
						{project.description || "Aucune description fournie pour ce projet"}
					</p>
				</div>

				<div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
					<span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm border ${getStatusColor(project.status).class} dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700`}>
						<div className="flex items-center gap-1 sm:gap-1.5">
							<span className="text-xs sm:text-sm" aria-hidden="true">{getStatusColor(project.status).emoji}</span>
							<span className="hidden sm:inline">{project.status ?? "Non défini"}</span>
						</div>
					</span>
					<span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm ${getPriorityColor(project.priority).class} dark:bg-gray-800 dark:text-gray-200`}>
						<div className="flex items-center gap-1 sm:gap-1.5">
							<span className="text-xs sm:text-sm" aria-hidden="true">{getPriorityColor(project.priority).emoji}</span>
							<span className="hidden sm:inline">{project.priority ?? "Non définie"}</span>
						</div>
					</span>
					{project.members && project.members.length > 0 && (
						<span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
							<div className="flex items-center gap-1 sm:gap-1.5">
								<Users className="w-3 h-3" aria-hidden="true" />
								<span>{project.members.length}</span>
								<span className="hidden sm:inline">membre{project.members.length > 1 ? 's' : ''}</span>
							</div>
						</span>
					)}
				</div>

				<div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-100 dark:border-gray-800">
					<div className="flex items-center space-x-1 sm:space-x-2 text-xs text-slate-500 dark:text-gray-400">
						<div className="p-1 sm:p-1.5 bg-slate-100 dark:bg-gray-800 rounded-lg">
							<Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
						</div>
						<time className="font-medium text-xs" dateTime={project.updatedAt}>
							{new Date(project.updatedAt).toLocaleDateString('fr-FR', {
								day: 'numeric',
								month: 'short',
								year: 'numeric'
							})}
						</time>
					</div>
				</div>
			</article>
		);
	}

	// Mode Liste
	return (
		<article className={`${cardStyles} dark:bg-gray-900 dark:[background-image:none] dark:border-gray-800 dark:ring-1 dark:ring-gray-800 dark:shadow-black/20 rounded-2xl shadow-xl hover:shadow-2xl dark:hover:shadow-gray-900/40 hover:scale-[1.02] transition-all duration-300 group p-4 sm:p-6 lg:p-8`}>
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
				<div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
					{headerIcon}
					<div className="flex-1 min-w-0">
						<Link
							to="/projects/$projectId"
							params={{ projectId: project.id.toString() }}
							className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg"
						>
							<h3 className={`text-lg sm:text-xl font-bold mb-2 ${titleColorClass} hover:bg-clip-text transition-all duration-200 hover:cursor-pointer line-clamp-2`}>
								{project.title}
							</h3>
						</Link>
						<p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
							{project.description || "Aucune description fournie pour ce projet"}
						</p>

						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
							<div className="flex flex-wrap gap-2 sm:gap-3">
								<span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm border ${getStatusColor(project.status).class} dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700`}>
									<div className="flex items-center gap-1 sm:gap-1.5">
										<span className="text-xs sm:text-sm" aria-hidden="true">{getStatusColor(project.status).emoji}</span>
										<span>{project.status ?? "Non défini"}</span>
									</div>
								</span>
								<span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm ${getPriorityColor(project.priority).class} dark:bg-gray-800 dark:text-gray-200`}>
									<div className="flex items-center gap-1 sm:gap-1.5">
										<span className="text-xs sm:text-sm" aria-hidden="true">{getPriorityColor(project.priority).emoji}</span>
										<span>{project.priority ?? "Non définie"}</span>
									</div>
								</span>
								{project.members && project.members.length > 0 && (
									<span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
										<div className="flex items-center gap-1 sm:gap-1.5">
											<Users className="w-3 h-3" aria-hidden="true" />
											<span>{project.members.length} membre{project.members.length > 1 ? 's' : ''}</span>
										</div>
									</span>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end space-x-1 sm:space-x-0 sm:space-y-3 sm:ml-4">
					<div className="flex items-center space-x-1 sm:space-x-2 text-xs text-slate-500 dark:text-gray-400 order-2 sm:order-1">
						<div className="p-1 sm:p-1.5 bg-slate-100 dark:bg-gray-800 rounded-lg">
							<Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
						</div>
						<time className="font-medium" dateTime={project.updatedAt}>
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
						</time>
					</div>
					<div className="flex items-center space-x-1 order-1 sm:order-2">
						<Link
							to="/projects/$projectId"
							params={{ projectId: project.id.toString() }}
							className="p-1 sm:p-1.5 lg:p-2.5 text-slate-400 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/80 dark:hover:bg-gray-800 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
							title="Voir les détails du projet"
							aria-label={`Voir les détails du projet ${project.title}`}
						>
							<FolderOpen className="w-3 h-3 sm:w-4 sm:h-4" />
						</Link>
						{isOwner && (
							<>
								<Link
									to="/projects/$projectId/edit"
									params={{ projectId: project.id.toString() }}
									className="p-1 sm:p-1.5 lg:p-2.5 text-slate-400 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/80 dark:hover:bg-gray-800 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
									title="Modifier le projet"
									aria-label={`Modifier le projet ${project.title}`}
								>
									<Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
								</Link>
								<button
									onClick={() => handleDelete(project.id)}
									className="p-1 sm:p-1.5 lg:p-2.5 text-slate-400 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
									title="Supprimer le projet"
									aria-label={`Supprimer le projet ${project.title}`}
								>
									<Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</article>
	);
};