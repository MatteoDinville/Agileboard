import React, { useState } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useProject } from "../utils/hooks/project";
import ProjectMembers from "../components/ProjectMembers";
import MembersListOnly from "../components/MembersListOnly";
import KanbanBoard from "../components/KanbanBoard";
import Backlog from "../components/Backlog";
import TaskModal from "../components/TaskModal";
import { taskService, type Task, type CreateTaskData, type UpdateTaskData } from "../services/task";
import { useQueryClient } from "@tanstack/react-query";
import { TaskStatus } from "../types/enums";
import {
	ArrowLeft,
	Edit3,
	Calendar,
	AlertCircle,
	Loader2,
	FolderOpen,
	LayoutGrid,
	Users,
	List,
} from "lucide-react";

const ProjectDetail: React.FC = () => {
	const { projectId } = useParams({ from: "/projects/$projectId" });
	const projectIdNum = Number(projectId); const [activeTab, setActiveTab] = useState<"overview" | "kanban" | "backlog" | "members">(
		"overview"
	);
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);

	const queryClient = useQueryClient();
	const { data: project, isLoading, isError, error } = useProject(projectIdNum);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
					<p className="text-gray-600">Chargement du projet…</p>
				</div>
			</div>
		);
	}

	if (isError || !project) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
				<div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
					<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						Projet introuvable
					</h3>
					<p className="text-gray-600 mb-6">
						{error?.message ||
							"Ce projet n'existe pas ou vous n'avez pas accès."}
					</p>
					<Link
						to="/projects"
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
					>
						Retour aux projets
					</Link>
				</div>
			</div>
		);
	}

	const getStatusColor = (status?: string) => {
		switch (status) {
			case "En cours":
				return {
					class: "bg-blue-100 text-blue-800 border-blue-200",
					emoji: "🚀",
				};
			case "Terminé":
				return {
					class: "bg-green-100 text-green-800 border-green-200",
					emoji: "✅",
				};
			case "En attente":
				return {
					class: "bg-yellow-100 text-yellow-800 border-yellow-200",
					emoji: "⏳",
				};
			default:
				return {
					class: "bg-gray-100 text-gray-800 border-gray-200",
					emoji: "📝",
				};
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

	// Fonctions de gestion des tâches
	const handleCreateTask = () => {
		setEditingTask(null);
		setIsTaskModalOpen(true);
	};

	const handleEditTask = (task: Task) => {
		setEditingTask(task);
		setIsTaskModalOpen(true);
	};

	const handleDeleteTask = async (taskId: number) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
			return;
		}

		try {
			await taskService.deleteTask(taskId);
			await queryClient.invalidateQueries({ queryKey: ["tasks", projectIdNum] });
		} catch (error) {
			console.error("Erreur lors de la suppression de la tâche:", error);
			alert("Erreur lors de la suppression de la tâche");
		}
	};

	const handleSaveTask = async (taskData: Partial<Task>) => {
		try {
			if (editingTask?.id) {
				// Modification d'une tâche existante
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
				// Création d'une nouvelle tâche
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

			// Fermer la modal et invalider le cache
			setIsTaskModalOpen(false);
			setEditingTask(null);
			await queryClient.invalidateQueries({ queryKey: ["tasks", projectIdNum] });
		} catch (error) {
			console.error("Erreur lors de la sauvegarde de la tâche:", error);
			alert("Erreur lors de la sauvegarde de la tâche");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
			{/* Header */}
			<header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-4">
							<Link
								to="/projects"
								className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
							>
								<ArrowLeft className="w-5 h-5" />
								<span>Retour</span>
							</Link>
							<div className="w-px h-6 bg-gray-300"></div>
							<div className="flex items-center space-x-3">
								<div className="w-8 h-8 bg-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
									<FolderOpen className="w-4 h-4 text-white" />
								</div>
								<h1 className="text-xl font-semibold text-gray-900">
									{project.title}
								</h1>
							</div>
						</div>

						<Link
							to="/projects/$projectId/edit"
							params={{ projectId: projectId }}
							className="flex items-center space-x-2 bg-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors shadow-lg"
						>
							<Edit3 className="w-4 h-4" />
							<span className="font-medium">Modifier</span>
						</Link>
					</div>
				</div>
			</header>{" "}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
					<div className="border-b border-gray-200">
						{" "}
						<nav className="flex space-x-8 px-8 py-4">
							<button
								onClick={() => setActiveTab("overview")}
								className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium cursor-pointer text-sm ${activeTab === "overview"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									} transition-colors`}
							>
								<FolderOpen className="w-4 h-4" />
								<span>Vue d'ensemble</span>
							</button>
							<button
								onClick={() => setActiveTab("kanban")}
								className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium cursor-pointer text-sm ${activeTab === "kanban"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									} transition-colors`}
							>
								<LayoutGrid className="w-4 h-4" />
								<span>Kanban</span>
							</button>
							<button
								onClick={() => setActiveTab("backlog")}
								className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium cursor-pointer text-sm ${activeTab === "backlog"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									} transition-colors`}
							>
								<List className="w-4 h-4" />
								<span>Backlog</span>
							</button>
							<button
								onClick={() => setActiveTab("members")}
								className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium cursor-pointer text-sm ${activeTab === "members"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									} transition-colors`}
							>
								<Users className="w-4 h-4" />
								<span>Membres</span>
							</button>
						</nav>
					</div>{" "}
					<div className="p-8">
						{activeTab === "overview" && (
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
								<div className="lg:col-span-2 space-y-8">
									<div>
										<div className="flex flex-wrap gap-3 mb-6">
											<span
												className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(project.status).class
													}`}
											>
												<div className="flex items-center gap-2">
													<span>
														{getStatusColor(project.status).emoji}
													</span>
													{project.status ?? "Non défini"}
												</div>
											</span>
											<span
												className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getPriorityColor(project.priority).class
													}`}
											>
												<div className="flex items-center gap-2">
													<span>
														{getPriorityColor(project.priority).emoji}
													</span>
													Priorité {project.priority ?? "Non définie"}
												</div>
											</span>
										</div>

										<h2 className="text-2xl font-bold text-gray-900 mb-4">
											Description
										</h2>
										<div className="bg-gray-50 rounded-lg p-6">
											<p className="text-gray-700 leading-relaxed">
												{project.description ||
													"Aucune description fournie pour ce projet."}
											</p>
										</div>

										<div className="flex items-center space-x-6 mt-8 pt-6 border-t border-gray-200">
											<div className="flex items-center space-x-3 text-sm text-gray-500">
												<div className="p-2 bg-gray-100 rounded-lg">
													<Calendar className="w-4 h-4" />
												</div>
												<div>
													<p className="font-medium">Créé le</p>
													<p>
														{new Date(project.createdAt).toLocaleDateString(
															"fr-FR",
															{
																day: "numeric",
																month: "long",
																year: "numeric",
															}
														)}
													</p>
												</div>
											</div>

											{project.updatedAt !== project.createdAt && (
												<div className="flex items-center space-x-3 text-sm text-gray-500">
													<div className="p-2 bg-gray-100 rounded-lg">
														<Calendar className="w-4 h-4" />
													</div>
													<div>
														<p className="font-medium">Modifié le</p>
														<p>
															{new Date(
																project.updatedAt
															).toLocaleDateString("fr-FR", {
																day: "numeric",
																month: "long",
																year: "numeric",
															})}
														</p>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
								<div className="lg:col-span-1">
									<ProjectMembers projectId={projectIdNum} isOwner={true} />
								</div>
							</div>
						)}
						{activeTab === "kanban" && (
							<KanbanBoard projectId={projectIdNum} />
						)}
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
								<MembersListOnly projectId={projectIdNum} />
							</div>
						)}
					</div>
				</div>
			</main>

			{/* Modal pour créer/éditer une tâche */}
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
