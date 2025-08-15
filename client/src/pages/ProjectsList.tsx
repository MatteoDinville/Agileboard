import React, { useState } from "react";
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
	Loader2,
	Users,
	Crown,
	UserCheck
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
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
								<Link to="/dashboard" className="text-white">
									<FolderOpen className="w-4 h-4 text-white" />
								</Link>
							</div>
							<h1 className="text-xl font-semibold text-gray-900">Mes Projets</h1>
							<span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
								{filteredProjects.length}
							</span>
						</div>

						<Link
							to="/projects/new"
							className="flex items-center space-x-2 bg-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors shadow-lg"
						>
							<Plus className="w-4 h-4" />
							<span className="font-medium">Nouveau projet</span>
						</Link>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 p-6 mb-8 border border-gray-100">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								type="text"
								placeholder="Rechercher un projet..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white"
							/>
						</div>

						<div className="flex items-center space-x-4">
							<div className="relative">
								<select
									value={filterStatus}
									onChange={(e) => setFilterStatus(e.target.value)}
									className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
								>
									<option value="Tous">Tous les statuts</option>
									<option value="En cours">En cours</option>
									<option value="Terminé">Terminé</option>
									<option value="En attente">En attente</option>
								</select>
								<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
							</div>

							<div className="flex bg-gray-100 rounded-lg p-1">
								<button
									onClick={() => setViewMode("list")}
									className={`p-2 rounded-md transition-colors ${viewMode === "list"
										? "bg-white text-indigo-600 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
										}`}
								>
									<List className="w-4 h-4" />
								</button>
								<button
									onClick={() => setViewMode("grid")}
									className={`p-2 rounded-md transition-colors ${viewMode === "grid"
										? "bg-white text-indigo-600 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
										}`}
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
					<div className={
						viewMode === "grid"
							? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
							: "space-y-6"
					}>
						{filteredProjects.map((project) => (
							<div
								key={project.id}
								className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group ${viewMode === "list" ? "p-8" : "p-7"
									}`}
							>
								{viewMode === "grid" ? (
									<>
										<div className="flex justify-between items-start mb-6">
											<div className="flex-1">
												<Link
													to="/projects/$projectId"
													params={{ projectId: project.id.toString() }}
													className="block"
												>
													<h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:bg-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-200 hover:cursor-pointer">
														{project.title}
													</h3>
												</Link>
												<p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
													{project.description ?? "Aucune description fournie pour ce projet"}
												</p>
											</div>
										</div>

										<div className="flex flex-wrap gap-3 mb-6">
											{/* Indicateur Owner/Membre */}
											{project.ownerId === user?.id ? (
												<span className="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-yellow-100 text-yellow-800 border border-yellow-200">
													<div className="flex items-center gap-1.5">
														<Crown className="w-3 h-3" />
														Propriétaire
													</div>
												</span>
											) : (
												<span className="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-blue-100 text-blue-800 border border-blue-200">
													<div className="flex items-center gap-1.5">
														<UserCheck className="w-3 h-3" />
														Membre
													</div>
												</span>
											)}

											<span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(project.status).class}`}>
												<div className="flex items-center gap-1.5">
													<span className="text-sm">{getStatusColor(project.status).emoji}</span>
													{project.status ?? "Non défini"}
												</div>
											</span>
											<span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getPriorityColor(project.priority).class}`}>
												<div className="flex items-center gap-1.5">
													<span className="text-sm">{getPriorityColor(project.priority).emoji}</span>
													{project.priority ?? "Non définie"}
												</div>
											</span>
											{project.members && project.members.length > 0 && (
												<span className="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-purple-100 text-purple-800">
													<div className="flex items-center gap-1.5">
														<Users className="w-3 h-3" />
														{project.members.length} membre{project.members.length > 1 ? 's' : ''}
													</div>
												</span>
											)}
										</div>										<div className="flex items-center justify-between pt-6 border-t border-slate-100">
											<div className="flex items-center space-x-2 text-xs text-slate-500">
												<div className="p-1.5 bg-slate-100 rounded-lg">
													<Calendar className="w-3.5 h-3.5" />
												</div>
												<span className="font-medium">
													{new Date(project.updatedAt).toLocaleDateString('fr-FR', {
														day: 'numeric',
														month: 'short',
														year: 'numeric'
													})}
												</span>
											</div>
											<div className="flex items-center space-x-1">
												<Link
													to="/projects/$projectId"
													params={{ projectId: project.id.toString() }}
													className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110"
													title="Voir les détails du projet"
												>
													<FolderOpen className="w-4 h-4" />
												</Link>
												{/* Actions réservées au propriétaire */}
												{project.ownerId === user?.id && (
													<>
														<Link
															to="/projects/$projectId/edit"
															params={{ projectId: project.id.toString() }}
															className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110"
															title="Modifier le projet"
														>
															<Edit3 className="w-4 h-4" />
														</Link>
														<button
															onClick={() => handleDelete(project.id)}
															className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer"
															title="Supprimer le projet"
														>
															<Trash2 className="w-4 h-4" />
														</button>
													</>
												)}
											</div>
										</div>
									</>
								) : (
									<div className="flex items-start justify-between">
										<div className="flex-1 pr-6">
											<div className="flex items-start justify-between mb-4">
												<div className="flex-1">
													<Link
														to="/projects/$projectId"
														params={{ projectId: project.id.toString() }}
														className="block"
													>
														<h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-200 hover:cursor-pointer">
															{project.title}
														</h3>
													</Link>
													<p className="text-slate-600 text-sm leading-relaxed mb-3">
														{project.description ?? "Aucune description fournie pour ce projet"}
													</p>
												</div>
											</div>

											<div className="flex items-center justify-between">
												<div className="flex gap-3">
													<span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(project.status).class}`}>
														<div className="flex items-center gap-1.5">
															<span className="text-sm">{getStatusColor(project.status).emoji}</span>
															{project.status ?? "Non défini"}
														</div>
													</span>
													<span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getPriorityColor(project.priority).class}`}>
														<div className="flex items-center gap-1.5">
															<span className="text-sm">{getPriorityColor(project.priority).emoji}</span>
															{project.priority ?? "Non définie"}
														</div>
													</span>
													{project.members && project.members.length > 0 && (
														<span className="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-purple-100 text-purple-800">
															<div className="flex items-center gap-1.5">
																<Users className="w-3 h-3" />
																{project.members.length} membre{project.members.length > 1 ? 's' : ''}
															</div>
														</span>
													)}
												</div>

												<div className="flex items-center space-x-3 text-xs text-slate-500">
													<div className="flex items-center space-x-2">
														<div className="p-1.5 bg-slate-100 rounded-lg">
															<Calendar className="w-3.5 h-3.5" />
														</div>
														<span className="font-medium">
															Modifié le {new Date(project.updatedAt).toLocaleDateString('fr-FR', {
																day: 'numeric',
																month: 'short',
																year: 'numeric'
															})}
														</span>
													</div>
												</div>
											</div>
										</div>

										<div className="flex items-center space-x-1 ml-4">
											<Link
												to="/projects/$projectId"
												params={{ projectId: project.id.toString() }}
												className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110"
												title="Voir les détails du projet"
											>
												<FolderOpen className="w-4 h-4" />
											</Link>
											<Link
												to="/projects/$projectId/edit"
												params={{ projectId: project.id.toString() }}
												className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110"
												title="Modifier le projet"
											>
												<Edit3 className="w-4 h-4" />
											</Link>
											<button
												onClick={() => handleDelete(project.id)}
												className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
												title="Supprimer le projet"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</main>
		</div>
	);
};

export default ProjectsList;
