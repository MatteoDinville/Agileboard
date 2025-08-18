import React, { useState, useMemo } from "react";
import { useProjects, useDeleteProject } from "../utils/hooks/project";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "@tanstack/react-router";
import {
	Plus,
	FolderOpen,
	Edit3,
	Trash2,
	Calendar,
	Search,
	Grid3X3,
	List,
	ChevronDown,
	AlertCircle,
	Users,
	Crown,
	UserCheck,
	ArrowLeft
} from "lucide-react";

const ProjectsList: React.FC = () => {
	const { data: projects, isLoading, isError, error } = useProjects();
	const { user } = useAuth();

	const deleteMutation = useDeleteProject();

	const [viewMode, setViewMode] = useState("list");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("Tous");

	const handleDelete = (id: number) => {
		if (confirm("Voulez-vous vraiment supprimer ce projet ?")) {
			deleteMutation.mutate(id);
		}
	};

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

	const filteredProjects = projects?.filter(project => {
		const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			project.description?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesFilter = filterStatus === "Tous" || project.status === filterStatus;
		return matchesSearch && matchesFilter;
	}) || [];

	// Séparer les projets en propriétaire vs membre
	const { ownedProjects, memberProjects } = useMemo(() => {
		const owned = filteredProjects.filter(project => project.ownerId === user?.id);
		const member = filteredProjects.filter(project => project.ownerId !== user?.id);
		return { ownedProjects: owned, memberProjects: member };
	}, [filteredProjects, user?.id]);

	const ProjectCard = ({ project, isOwner }: { project: any; isOwner: boolean }) => {
		const cardStyles = isOwner
			? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200/60 shadow-amber-100/50"
			: "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/60 shadow-blue-100/50";

		const headerIcon = isOwner ? (
			<div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
				<Crown className="w-4 h-4 text-white" />
			</div>
		) : (
			<div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
				<UserCheck className="w-4 h-4 text-white" />
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
									<FolderOpen className="w-4 h-4" />
								</Link>
								{isOwner && (
									<>
										<Link
											to="/projects/$projectId/edit"
											params={{ projectId: project.id.toString() }}
											className="p-1.5 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white/80 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110"
											title="Modifier le projet"
										>
											<Edit3 className="w-4 h-4" />
										</Link>
										<button
											onClick={() => handleDelete(project.id)}
											className="p-1.5 sm:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110"
											title="Supprimer le projet"
										>
											<Trash2 className="w-4 h-4" />
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
										<Users className="w-3 h-3" />
										<span>{project.members.length}</span>
										<span className="hidden sm:inline">membre{project.members.length > 1 ? 's' : ''}</span>
									</div>
								</span>
							)}
						</div>

						<div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-100">
							<div className="flex items-center space-x-1 sm:space-x-2 text-xs text-slate-500">
								<div className="p-1 sm:p-1.5 bg-slate-100 rounded-lg">
									<Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
								</div>
								<span className="font-medium text-xs">
									{new Date(project.updatedAt).toLocaleDateString('fr-FR', {
										day: 'numeric',
										month: 'short',
										year: 'numeric'
									})}
								</span>
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
									className="block"
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
													<Users className="w-3 h-3" />
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
									<Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
									<FolderOpen className="w-4 h-4" />
								</Link>
								{isOwner && (
									<>
										<Link
											to="/projects/$projectId/edit"
											params={{ projectId: project.id.toString() }}
											className="p-1.5 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white/80 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110"
											title="Modifier le projet"
										>
											<Edit3 className="w-4 h-4" />
										</Link>
										<button
											onClick={() => handleDelete(project.id)}
											className="p-1.5 sm:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110"
											title="Supprimer le projet"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
					<p className="text-gray-600">Chargement des projets…</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
				<div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
					<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
					<p className="text-gray-600">Erreur : {error?.message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
			<header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
							<Link
								to="/dashboard"
								className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
							>
								<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
								<span className="hidden sm:block">Retour</span>
							</Link>
							<div className="w-px h-4 sm:h-6 bg-gray-300 hidden sm:block"></div>
							<div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
								<div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
									<FolderOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
								</div>
								<h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Projets</h1>
								<span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded-full flex-shrink-0">
									{projects?.length}
								</span>
							</div>
						</div>

						<Link
							to="/projects/new"
							className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors shadow-lg flex-shrink-0"
						>
							<Plus className="w-4 h-4" />
							<span className="font-medium hidden sm:block">Nouveau projet</span>
							<span className="font-medium sm:hidden">Nouveau</span>
						</Link>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
				<div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
					<div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
						<div className="relative flex-1 max-w-full lg:max-w-md">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								type="text"
								placeholder="Rechercher un projet..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white text-sm sm:text-base"
							/>
						</div>

						<div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
							<div className="relative">
								<select
									value={filterStatus}
									onChange={(e) => setFilterStatus(e.target.value)}
									className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors w-full sm:w-auto text-sm sm:text-base"
								>
									<option value="Tous">Tous les statuts</option>
									<option value="En cours">En cours</option>
									<option value="Terminé">Terminé</option>
									<option value="En attente">En attente</option>
								</select>
								<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
							</div>

							<div className="flex bg-gray-100 rounded-lg p-1 self-start sm:self-auto">
								<button
									onClick={() => setViewMode("list")}
									className={`p-2 rounded-md transition-colors ${viewMode === "list"
										? "bg-white text-indigo-600 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
										}`}
									title="Vue liste"
								>
									<List className="w-4 h-4" />
								</button>
								<button
									onClick={() => setViewMode("grid")}
									className={`p-2 rounded-md transition-colors ${viewMode === "grid"
										? "bg-white text-indigo-600 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
										}`}
									title="Vue grille"
								>
									<Grid3X3 className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				</div>

				{filteredProjects.length === 0 && (
					<div className="text-center py-16">
						<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<FolderOpen className="w-12 h-12 text-gray-400" />
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							{searchTerm || filterStatus !== "Tous" ? "Aucun projet trouvé" : "Aucun projet pour le moment"}
						</h3>
						<p className="text-gray-600 mb-8">
							{searchTerm || filterStatus !== "Tous"
								? "Essayez de modifier vos critères de recherche"
								: "Commencez par créer votre premier projet"
							}
						</p>
						{!searchTerm && filterStatus === "Tous" && (
							<Link
								to="/projects/new"
								className="bg-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors font-medium inline-block"
							>
								Créer mon premier projet
							</Link>
						)}
					</div>
				)}

				{filteredProjects.length > 0 && (
					<div className="space-y-8 sm:space-y-12">
						{/* Section Mes Projets (Propriétaire) */}
						{ownedProjects.length > 0 && (
							<section>
								<div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
									<div className="flex items-center space-x-3">
										<div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
											<Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
										</div>
										<div>
											<div className="flex items-center space-x-2">
												<h2 className="text-xl sm:text-2xl font-bold text-gray-900">Mes Projets</h2>
												<span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 sm:px-3 py-1 rounded-full">
													{ownedProjects.length}
												</span>
											</div>
											<p className="text-gray-600 text-sm">Projets dont vous êtes propriétaire</p>
										</div>
									</div>
								</div>

								<div className={
									viewMode === "grid"
										? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
										: "space-y-4 sm:space-y-6"
								}>
									{ownedProjects.map((project) => (
										<ProjectCard key={project.id} project={project} isOwner={true} />
									))}
								</div>
							</section>
						)}

						{/* Section Projets Collaboratifs (Membre) */}
						{memberProjects.length > 0 && (
							<section>
								<div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
									<div className="flex items-center space-x-3">
										<div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
											<UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
										</div>
										<div>
											<div className="flex items-center space-x-2">
												<h2 className="text-xl sm:text-2xl font-bold text-gray-900">Projets Collaboratifs</h2>
												<span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 sm:px-3 py-1 rounded-full">
													{memberProjects.length}
												</span>
											</div>
											<p className="text-gray-600 text-sm">Projets où vous êtes membre</p>
										</div>
									</div>
								</div>

								<div className={
									viewMode === "grid"
										? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
										: "space-y-4 sm:space-y-6"
								}>
									{memberProjects.map((project) => (
										<ProjectCard key={project.id} project={project} isOwner={false} />
									))}
								</div>
							</section>
						)}
					</div>
				)}
			</main>
		</div>
	);
};

export default ProjectsList;
