// frontend/src/pages/ProjectForm.tsx

import React, { useEffect, useState } from "react";
import {
	useCreateProject,
	useProject,
	useUpdateProject,
} from "../utils/hooks/project";
import { useNavigate } from "@tanstack/react-router";
import type { ProjectStatus, ProjectPriority } from "../services/project";

interface ProjectFormProps {
	projectId?: number;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ projectId }) => {
	const navigate = useNavigate();
	const isEditMode = typeof projectId === "number";

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState<ProjectStatus>("En attente");
	const [priority, setPriority] = useState<ProjectPriority>("Basse");

	const {
		data: existingProject,
		isLoading: isLoadingProject,
		isError: isErrorProject,
		error: errorProject,
	} = useProject(projectId ?? 0);

	const createMutation = useCreateProject();
	const updateMutation = useUpdateProject();

	useEffect(() => {
		if (isEditMode) {
			if (existingProject) {
				setTitle(existingProject.title);
				setDescription(existingProject.description ?? "");
				setStatus(existingProject.status ?? "En attente");
				setPriority(existingProject.priority ?? "Basse");
			}
		}
	}, [existingProject, isEditMode]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isEditMode && projectId) {
			updateMutation.mutate(
				{ id: projectId, data: { title, description, status, priority } },
				{
					onSuccess: () => {
						navigate({ to: "/projects" });
					},
				}
			);
		} else {
			createMutation.mutate(
				{ title, description, status, priority },
				{
					onSuccess: () => {
						navigate({ to: "/projects" });
					},
				}
			);
		}
	};

	if (isEditMode && isLoadingProject) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
				<div className="max-w-2xl mx-auto">
					<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8">
						<div className="flex items-center justify-center py-12">
							<div className="flex items-center space-x-3">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
								<span className="text-lg text-slate-600 font-medium">Chargement du projet…</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (isEditMode && isErrorProject) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
				<div className="max-w-2xl mx-auto">
					<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8">
						<div className="text-center py-12">
							<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-slate-800 mb-2">Erreur de chargement</h3>
							<p className="text-slate-600 mb-6">{(errorProject)?.message ?? "Une erreur est survenue"}</p>
							<button
								onClick={() => navigate({ to: "/projects" })}
								className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								Retour aux projets
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
			<div className="max-w-2xl w-full mx-auto">
				<div className="mb-8 text-center">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-2">
						{isEditMode ? "Modifier le projet" : "Créer un nouveau projet"}
					</h1>
					<p className="text-slate-600 text-lg">
						{isEditMode
							? "Apportez les modifications nécessaires à votre projet"
							: "Donnez vie à votre nouvelle idée"
						}
					</p>
				</div>

				<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8">
					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Champ Titre */}
						<div className="group">
							<label
								htmlFor="project-title"
								className="block text-sm font-semibold text-slate-700 mb-3"
							>
								Titre du projet
							</label>
							<input
								id="project-title"
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 group-hover:border-slate-300"
								placeholder="Mon super projet..."
								required
							/>
						</div>

						{/* Champ Description */}
						<div className="group">
							<label
								htmlFor="project-description"
								className="block text-sm font-semibold text-slate-700 mb-3"
							>
								Description{" "}
								<span className="text-slate-400 font-normal ml-2">(optionnel)</span>
							</label>
							<textarea
								id="project-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 group-hover:border-slate-300 resize-none"
								placeholder="Décrivez votre projet, ses objectifs, ses particularités..."
								rows={4}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="group">
								<label
									htmlFor="project-status"
									className="block text-sm font-semibold text-slate-700 mb-3"
								>
									Statut
								</label>
								<select
									id="project-status"
									value={status}
									onChange={(e) => setStatus(e.target.value as ProjectStatus)}
									className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 group-hover:border-slate-300 appearance-none cursor-pointer"
								>
									<option value="En attente">En attente</option>
									<option value="En cours">En cours</option>
									<option value="Terminé">Terminé</option>
								</select>
							</div>

							<div className="group">
								<label
									htmlFor="project-priority"
									className="block text-sm font-semibold text-slate-700 mb-3"
								>
									Priorité
								</label>
								<select
									id="project-priority"
									value={priority}
									onChange={(e) => setPriority(e.target.value as ProjectPriority)}
									className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 group-hover:border-slate-300 appearance-none cursor-pointer"
								>
									<option value="Basse">Basse</option>
									<option value="Moyenne">Moyenne</option>
									<option value="Haute">Haute</option>
								</select>
							</div>
						</div>
						{isEditMode && updateMutation.isError && (
							<div className="bg-red-50 border border-red-200 rounded-xl p-4">
								<div className="flex items-center">
									<svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<p className="text-red-700 font-medium">
										{(updateMutation.error)?.message ?? "Erreur lors de la mise à jour"}
									</p>
								</div>
							</div>
						)}
						{!isEditMode && createMutation.isError && (
							<div className="bg-red-50 border border-red-200 rounded-xl p-4">
								<div className="flex items-center">
									<svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<p className="text-red-700 font-medium">
										{(createMutation.error)?.message ?? "Erreur lors de la création"}
									</p>
								</div>
							</div>
						)}
						<div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
							<button
								type="submit"
								disabled={
									(isEditMode && updateMutation.isPending) ||
									(!isEditMode && createMutation.isPending)
								}
								className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center hover:cursor-pointer"
							>
								{(() => {
									if (isEditMode) {
										return updateMutation.isPending ? (
											<>
												<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
												Mise à jour en cours...
											</>
										) : (
											<>
												<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
												</svg>
												Mettre à jour
											</>
										);
									} else {
										return createMutation.isPending ? (
											<>
												<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
												Création en cours...
											</>
										) : (
											<>
												<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
												</svg>
												Créer le projet
											</>
										);
									}
								})()}
							</button>
							<button
								type="button"
								onClick={() => navigate({ to: "/projects" })}
								className="flex-1 sm:flex-initial bg-white/80 text-slate-700 px-6 py-3 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all duration-200 flex items-center justify-center hover:cursor-pointer"
							>
								<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
								Annuler
							</button>
						</div>
					</form>
				</div>
				<div className="mt-6 text-center">
					<p className="text-slate-500 text-sm">
						{isEditMode
							? "Les modifications seront sauvegardées immédiatement"
							: "Votre projet sera automatiquement sauvegardé"
						}
					</p>
				</div>
			</div>
		</div>
	);
};

export default ProjectForm;