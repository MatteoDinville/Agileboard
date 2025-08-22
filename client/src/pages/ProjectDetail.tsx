import React, { useState } from "react";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { useProject, useProjectMembers } from "../utils/hooks/project";
import { useAuth } from "../contexts/AuthContext";
import MembersListOnly from "../components/MembersListOnly";
import KanbanBoard from "../components/KanbanBoard";
import Backlog from "../components/Backlog";
import TaskModal from "../components/TaskModal";
import { PageLoader } from "../components/Loading";
import { taskService, type Task, type CreateTaskData, type UpdateTaskData } from "../services/task";
import { useQueryClient } from "@tanstack/react-query";
import { TaskStatus } from "../types/enums";
import { ArrowLeft, Edit3, Calendar, AlertCircle, FolderOpen, LayoutGrid, Users, List, Trash2 } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { projectService } from "../services/project";
import toast from "react-hot-toast";

const ProjectDetail: React.FC = () => {
	const { projectId } = useParams({ from: "/projects/$projectId" });
	const projectIdNum = Number(projectId);
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<"overview" | "kanban" | "backlog" | "members">("overview");
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);

	const queryClient = useQueryClient();
	const { user } = useAuth();
	const { data: project, isLoading, isError, error } = useProject(projectIdNum);
	const { data: members } = useProjectMembers(projectIdNum);

	if (isLoading) return <PageLoader label="Chargement du projet..." />;

	if (isError || !project) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:bg-gray-900 dark:bg-none flex items-center justify-center">
				<div className="text-center bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-black/20 p-8 max-w-md border border-gray-100 dark:border-gray-800">
					<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Projet introuvable</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-6">
						{error?.message || "Ce projet n'existe pas ou vous n'avez pas accès."}
					</p>
					<Link to="/projects" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
						Retour aux projets
					</Link>
				</div>
			</div>
		);
	}

	const getStatusColor = (status?: string) => {
		switch (status) {
			case "En cours":
				return { class: "bg-blue-100 text-blue-800 border-blue-200", emoji: "🚀" };
			case "Terminé":
				return { class: "bg-green-100 text-green-800 border-green-200", emoji: "✅" };
			case "En attente":
				return { class: "bg-yellow-100 text-yellow-800 border-yellow-200", emoji: "⏳" };
			default:
				return { class: "bg-gray-100 text-gray-800 border-gray-200", emoji: "📝" };
		}
	};

	const getPriorityColor = (priority?: string) => {
		switch (priority) {
			case "Haute":
				return { class: "bg-red-100 text-red-800", emoji: "🔥" };
			case "Moyenne":
				return { class: "bg-orange-100 text-orange-800", emoji: "⚠️" };
			case "Basse":
				return { class: "bg-green-100 text-green-800", emoji: "🌱" };
			default:
				return { class: "bg-gray-100 text-gray-800", emoji: "📊" };
		}
	};

	const handleCreateTask = () => {
		setEditingTask(null);
		setIsTaskModalOpen(true);
	};

	const handleEditTask = (task: Task) => {
		setEditingTask(task);
		setIsTaskModalOpen(true);
	};

	const handleDeleteTask = async (taskId: number) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;

		try {
			await taskService.deleteTask(taskId);
			await queryClient.invalidateQueries({ queryKey: ["tasks", projectIdNum] });
		} catch (error) {
			console.error("Erreur lors de la suppression de la tâche:", error);
			alert("Erreur lors de la suppression de la tâche");
		}
	};

	const handleDeleteProject = async (projectId: number) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) return;

		try {
			await projectService.deleteProject(projectId);
			toast.success("Projet supprimé avec succès", {
				icon: "✅",
				duration: 4000,
				style: {
					backgroundColor: "#ecfdf5",
					color: "#065f46",
				},
			});
			navigate({ to: "/projects" });
			queryClient.invalidateQueries({ queryKey: ["projects"] });

		} catch (error) {
			console.error("Erreur lors de la suppression du projet:", error);
			toast.error("Erreur lors de la suppression du projet", {
				icon: "❌",
				duration: 4000,
				style: {
					border: "1px solid #ef4444",
					backgroundColor: "#fef2f2",
					color: "#991b1b",
				},
			});
		}
	};

	const handleSaveTask = async (taskData: Partial<Task>) => {
		try {
			if (editingTask?.id) {
				const updateData: UpdateTaskData = {
					title: taskData.title,
					description: taskData.description,
					status: taskData.status,
					priority: taskData.priority,
					dueDate: taskData.dueDate,
					assignedToId: taskData.assignedToId,
				};
				await taskService.updateTask(editingTask.id, updateData);
			} else {
				const createData: CreateTaskData = {
					title: taskData.title ?? "",
					description: taskData.description,
					status: taskData.status ?? TaskStatus.A_FAIRE,
					priority: taskData.priority,
					dueDate: taskData.dueDate,
					assignedToId: taskData.assignedToId,
				};
				await taskService.createTask(projectIdNum, createData);
			}

			setIsTaskModalOpen(false);
			setEditingTask(null);
			await queryClient.invalidateQueries({ queryKey: ["tasks", projectIdNum] });
		} catch (error) {
			console.error("Erreur lors de la sauvegarde de la tâche:", error);
			alert("Erreur lors de la sauvegarde de la tâche");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:bg-gray-900 dark:bg-none">
			{/* Header */}
			<header className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800 sticky top-0 z-10 transition-colors">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
							<Link
								to="/projects"
								className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors flex-shrink-0"
							>
								<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
								<span className="hidden sm:block">Retour</span>
							</Link>
							<div className="w-px h-4 sm:h-6 bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
							<div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
								<div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
									<FolderOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
								</div>
								<h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
									{project.title}
								</h1>
							</div>
						</div>
						<ThemeToggle className="mr-4 sm:ml-6" />
						{project.ownerId === user?.id && (
							<div className="flex items-center gap-2">
								<button
									onClick={() => handleDeleteProject(project.id)}
									className="flex items-center space-x-1 sm:space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors shadow-lg flex-shrink-0 cursor-pointer"
									title="Supprimer le projet"
								>
									<Trash2 className="w-4 h-4" />
									<span className="font-medium hidden sm:block">Supprimer</span>
								</button>

								<Link
									to="/projects/$projectId/edit"
									params={{ projectId: projectId }}
									className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors shadow-lg flex-shrink-0"
								>
									<Edit3 className="w-4 h-4" />
									<span className="font-medium hidden sm:block">Modifier</span>
								</Link>
							</div>
						)}
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
				<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-black/20 border border-gray-100 dark:border-gray-800 mb-6 sm:mb-8 transition-colors">
					<div className="border-b border-gray-200 dark:border-gray-800">
						<nav className="flex space-x-2 sm:space-x-8 px-4 sm:px-8 py-3 sm:py-4 overflow-x-auto">
							<button
								onClick={() => setActiveTab("overview")}
								className={`flex items-center space-x-1 sm:space-x-2 py-2 px-1 border-b-2 font-medium cursor-pointer text-sm whitespace-nowrap ${activeTab === "overview"
									? "border-blue-500 text-blue-600 dark:text-blue-300"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-700"
									} transition-colors`}
							>
								<FolderOpen className="w-4 h-4" />
								<span className="hidden sm:inline">Vue d'ensemble</span>
								<span className="sm:hidden">Vue</span>
							</button>
							<button
								onClick={() => setActiveTab("kanban")}
								className={`flex items-center space-x-1 sm:space-x-2 py-2 px-1 border-b-2 font-medium cursor-pointer text-sm whitespace-nowrap ${activeTab === "kanban"
									? "border-blue-500 text-blue-600 dark:text-blue-300"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-700"
									} transition-colors`}
							>
								<LayoutGrid className="w-4 h-4" />
								<span>Kanban</span>
							</button>
							<button
								onClick={() => setActiveTab("backlog")}
								className={`flex items-center space-x-1 sm:space-x-2 py-2 px-1 border-b-2 font-medium cursor-pointer text-sm whitespace-nowrap ${activeTab === "backlog"
									? "border-blue-500 text-blue-600 dark:text-blue-300"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-700"
									} transition-colors`}
							>
								<List className="w-4 h-4" />
								<span>Backlog</span>
							</button>
							<button
								onClick={() => setActiveTab("members")}
								className={`flex items-center space-x-1 sm:space-x-2 py-2 px-1 border-b-2 font-medium cursor-pointer text-sm whitespace-nowrap ${activeTab === "members"
									? "border-blue-500 text-blue-600 dark:text-blue-300"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-700"
									} transition-colors`}
							>
								<Users className="w-4 h-4" />
								<span>Membres</span>
							</button>
						</nav>
					</div>

					<div className="p-4 sm:p-6 lg:p-8">
						{activeTab === "overview" && (
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
								<div className="lg:col-span-2 space-y-6 lg:space-y-8">
									<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900 rounded-xl p-4 sm:p-6 border border-blue-100 dark:border-gray-800 flex justify-center transition-colors">
										<div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center">
											{project.ownerId === user?.id && (
												<span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm border bg-orange-50 text-orange-800 border-orange-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600/30`}>
													<div className="flex items-center gap-1 sm:gap-2">
														<span className="font-medium">
															👑 <span className="hidden sm:inline">Propriétaire</span>
														</span>
													</div>
												</span>
											)}
											<span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm border ${getStatusColor(project.status).class}`}>
												<div className="flex items-center gap-1 sm:gap-2">
													<span className="text-sm sm:text-base">{getStatusColor(project.status).emoji}</span>
													<span className="font-medium">{project.status ?? "Non défini"}</span>
												</div>
											</span>
											<span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm border ${getPriorityColor(project.priority).class}`}>
												<div className="flex items-center gap-1 sm:gap-2">
													<span className="text-base">{getPriorityColor(project.priority).emoji}</span>
													<span className="font-medium">Priorité {project.priority ?? "Non définie"}</span>
												</div>
											</span>
											<div className="flex items-center gap-2">
												<span className="px-4 py-2 rounded-full text-sm font-semibold shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-200 dark:border-blue-900/40">
													<div className="flex items-center gap-2">
														<Users className="w-4 h-4" />
														<span>{members?.length || 0} Membre{(members?.length || 0) > 1 ? 's' : ''}</span>
													</div>
												</span>
											</div>
										</div>
									</div>
									<div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-black/20 border border-gray-200 dark:border-gray-800 p-6 transition-colors">
										<div className="flex items-center gap-3 mb-4">
											<div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
												<Edit3 className="w-4 h-4 text-white" />
											</div>
											<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Description du projet</h2>
										</div>
										<div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-none dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
											<p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
												{project.description ||
													"Aucune description fournie pour ce projet. Ajoutez une description pour mieux expliquer les objectifs et le contexte de ce projet."}
											</p>
										</div>
									</div>
									<div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-black/20 border border-gray-200 dark:border-gray-800 p-6 transition-colors">
										<div className="flex items-center gap-3 mb-4">
											<div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
												<Calendar className="w-4 h-4 text-white" />
											</div>
											<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Chronologie</h2>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:bg-none dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-gray-800 transition-colors">
												<div className="flex items-center space-x-3">
													<div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
														<Calendar className="w-5 h-5 text-green-600" />
													</div>
													<div>
														<p className="font-semibold text-green-800 dark:text-green-300">Créé le</p>
														<p className="text-green-700 dark:text-green-200">
															{new Date(project.createdAt).toLocaleDateString("fr-FR", {
																day: "numeric",
																month: "long",
																year: "numeric",
																weekday: "long",
															})}
														</p>
													</div>
												</div>
											</div>

											{project.updatedAt !== project.createdAt && (
												<div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-gray-800 transition-colors">
													<div className="flex items-center space-x-3">
														<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
															<Edit3 className="w-5 h-5 text-blue-600" />
														</div>
														<div>
															<p className="font-semibold text-blue-800 dark:text-blue-300">Modifié le</p>
															<p className="text-blue-700 dark:text-blue-200">
																{new Date(project.updatedAt).toLocaleDateString("fr-FR", {
																	day: "numeric",
																	month: "long",
																	year: "numeric",
																	weekday: "long",
																})}
															</p>
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>

								<div className="space-y-6">
									<div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-black/20 border border-gray-200 dark:border-gray-800 p-6 transition-colors">
										<div className="flex items-center gap-3 mb-4">
											<div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
												<Users className="w-4 h-4 text-white" />
											</div>
											<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Équipe</h3>
										</div>
										<div className="space-y-3">
											{project.owner && project.ownerId !== user?.id && (
												<div className="flex items-center space-x-3 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900 border border-blue-200 dark:border-gray-800">
													<div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
														<span className="text-xs font-semibold text-white">
															{(project.owner.name || project.owner.email).charAt(0).toUpperCase()}
														</span>
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{project.owner.name || "Propriétaire"}</p>
															<span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 rounded-full">👑 Propriétaire</span>
														</div>
														<p className="text-xs text-gray-500 dark:text-gray-400 truncate">{project.owner.email}</p>
													</div>
												</div>
											)}

											{members && members.length > 0 ? (
												<>
													{members.slice(0, 3).map((member) => (
														<div key={member.user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
															<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
																<span className="text-xs font-semibold text-white">
																	{(member.user.name || member.user.email).charAt(0).toUpperCase()}
																</span>
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{member.user.name || "Utilisateur"}</p>
																<p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.user.email}</p>
															</div>
														</div>
													))}
													{members.length > 3 && (
														<div className="text-center">
															<button onClick={() => setActiveTab("members")} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline">
																Voir tous les membres ({members.length})
															</button>
														</div>
													)}
												</>
											) : (
												<div className="text-center py-4">
													<Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
													<p className="text-sm text-gray-500 dark:text-gray-400">Aucun membre</p>
												</div>
											)}
										</div>
									</div>

									<div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900 rounded-xl p-6 border border-blue-200 dark:border-gray-800 transition-colors">
										<h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
										<div className="space-y-3">
											<button
												onClick={() => setActiveTab("kanban")}
												className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer"
											>
												<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
													<LayoutGrid className="w-4 h-4 text-blue-600" />
												</div>
												<div className="text-left">
													<p className="font-medium text-gray-900 dark:text-gray-100">Voir le Kanban</p>
													<p className="text-sm text-gray-500 dark:text-gray-400">Gérer les tâches</p>
												</div>
											</button>
											<button
												onClick={() => setActiveTab("backlog")}
												className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer"
											>
												<div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
													<List className="w-4 h-4 text-green-600" />
												</div>
												<div className="text-left">
													<p className="font-medium text-gray-900 dark:text-gray-100">Voir le Backlog</p>
													<p className="text-sm text-gray-500 dark:text-gray-400">Liste des tâches</p>
												</div>
											</button>
											{project.ownerId == user?.id ? (
												<button
													onClick={() => setActiveTab("members")}
													className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer"
												>
													<div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
														<Users className="w-4 h-4 text-purple-600" />
													</div>
													<div className="text-left">
														<p className="font-medium text-gray-900 dark:text-gray-100">Gérer l'équipe</p>
														<p className="text-sm text-gray-500 dark:text-gray-400">Ajouter/retirer des membres</p>
													</div>
												</button>
											) : (
												<button
													onClick={() => setActiveTab("members")}
													className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer"
												>
													<div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
														<Users className="w-4 h-4 text-purple-600" />
													</div>
													<div className="text-left">
														<p className="font-medium text-gray-900 dark:text-gray-100">Voir les membres</p>
														<p className="text-sm text-gray-500 dark:text-gray-400">Consulter les membres de l'équipe</p>
													</div>
												</button>
											)}
										</div>
									</div>
								</div>
							</div>
						)}

						{activeTab === "kanban" && <KanbanBoard projectId={projectIdNum} />}

						{activeTab === "backlog" && (
							<Backlog
								projectId={projectIdNum}
								onEditTask={handleEditTask}
								onDeleteTask={handleDeleteTask}
								onCreateTask={handleCreateTask}
							/>
						)}

						{activeTab === "members" && (
							<div className="w-full">
								<div className="mb-6">
									<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gestion des membres</h2>
									<p className="text-gray-600 dark:text-gray-300">Gérez les membres de votre projet et leurs accès.</p>
								</div>
								<MembersListOnly projectId={projectIdNum} isOwner={project.ownerId === user?.id} />
							</div>
						)}
					</div>
				</div>
			</main>

			<TaskModal
				isOpen={isTaskModalOpen}
				onClose={() => {
					setIsTaskModalOpen(false);
					setEditingTask(null);
				}}
				task={editingTask}
				onSave={handleSaveTask}
				projectId={projectIdNum}
			/>
		</div>
	);
};

export default ProjectDetail;
