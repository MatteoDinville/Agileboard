import React, { useEffect, useState } from "react";
import {
	useCreateProject,
	useProject,
	useUpdateProject,
} from "../utils/hooks/project";
import { useNavigate } from "@tanstack/react-router";
import type { ProjectStatus, ProjectPriority } from "../services/project";
import { PageLoader } from "../components/Loading";
import toast from "react-hot-toast";
import { Check } from "lucide-react";

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
						toast.success("Projet modifié avec succès !", {
							icon: <Check className="text-green-500 w-4 h-4" />,
							duration: 3000,
							style: {
								background: '#DCFCE7',
							},
						});
						navigate({ to: `/projects/${projectId}` });
					},
				}
			);
		} else {
			createMutation.mutate(
				{ title, description, status, priority },
				{
					onSuccess: () => {
						toast.success("Projet créé avec succès !", {
							icon: <Check className="text-green-500 w-4 h-4" />,
							duration: 3000,
							style: {
								background: '#DCFCE7',
							},
						});
						navigate({ to: "/projects" });
					},
				}
			);
		}
	};

	if (isEditMode && isLoadingProject) {
		return <PageLoader label="Chargement du projet..." />;
	}

	if (isEditMode && isErrorProject) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:[background-image:none] dark:bg-gray-950 p-6">
				<div className="max-w-2xl mx-auto">
					<div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-black/30 border border-white/60 dark:border-gray-700 p-8">
						<div className="text-center py-12">
							<div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-slate-800 dark:text-gray-100 mb-2">Erreur de chargement</h3>
							<p className="text-slate-600 dark:text-gray-300 mb-6">{(errorProject)?.message ?? "Une erreur est survenue"}</p>
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
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:[background-image:none] dark:bg-gray-900 p-3 sm:p-6">
			<div className="max-w-2xl w-full mx-auto">
				<div className="mb-6 sm:mb-8 text-center">
					<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 dark:[background-image:none] dark:!text-blue-200 bg-clip-text text-transparent mb-2">
						{isEditMode ? "Modifier le projet" : "Créer un nouveau projet"}
					</h1>
					<p className="text-slate-600 dark:text-gray-300 text-base sm:text-lg">
						{isEditMode
							? "Apportez les modifications nécessaires à votre projet"
							: "Donnez vie à votre nouvelle idée"
						}
					</p>
				</div>

				<div className="bg-white/80 dark:bg-gray-900/75 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-black/30 border border-white/60 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
					<form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
						{/* Champ Titre */}
						<div className="group">
							<label
								htmlFor="project-title"
								className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-2 sm:mb-3"
							>
								Titre du projet
							</label>
							<input
								id="project-title"
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full bg-white/50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 group-hover:border-slate-300 dark:group-hover:border-gray-600 text-sm sm:text-base"
								placeholder="Mon super projet..."
								required
							/>
						</div>

						{/* Champ Description */}
						<div className="group">
							<label
								htmlFor="project-description"
								className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-2 sm:mb-3"
							>
								Description{" "}
								<span className="text-slate-400 font-normal ml-1 sm:ml-2">(optionnel)</span>
							</label>
							<textarea
								id="project-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="w-full bg-white/50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 group-hover:border-slate-300 dark:group-hover:border-gray-600 resize-none text-sm sm:text-base"
								placeholder="Décrivez votre projet, ses objectifs, ses particularités..."
								rows={4}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
							<div className="group">
								<label
									htmlFor="project-status"
									className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-2 sm:mb-3"
								>
									Statut
								</label>
								<select
									id="project-status"
									value={status}
									onChange={(e) => setStatus(e.target.value as ProjectStatus)}
									className="w-full bg-white/50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 group-hover:border-slate-300 dark:group-hover:border-gray-600 appearance-none cursor-pointer text-sm sm:text-base"
								>
									<option value="En attente">En attente</option>
									<option value="En cours">En cours</option>
									<option value="Terminé">Terminé</option>
								</select>
							</div>

							<div className="group">
								<label
									htmlFor="project-priority"
									className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-2 sm:mb-3"
								>
									Priorité
								</label>
								<select
									id="project-priority"
									value={priority}
									onChange={(e) => setPriority(e.target.value as ProjectPriority)}
									className="w-full bg-white/50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 group-hover:border-slate-300 dark:group-hover:border-gray-600 appearance-none cursor-pointer text-sm sm:text-base"
								>
									<option value="Basse">Basse</option>
									<option value="Moyenne">Moyenne</option>
									<option value="Haute">Haute</option>
								</select>
							</div>
						</div>
						{isEditMode && updateMutation.isError && (
							<div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl p-3 sm:p-4">
								<div className="flex items-center">
									<svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<p className="text-red-700 dark:text-red-300 font-medium text-sm sm:text-base">
										{(updateMutation.error)?.message ?? "Erreur lors de la mise à jour"}
									</p>
								</div>
							</div>
						)}
						{!isEditMode && createMutation.isError && (
							<div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl p-3 sm:p-4">
								<div className="flex items-center">
									<svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<p className="text-red-700 dark:text-red-300 font-medium text-sm sm:text-base">
										{(createMutation.error)?.message ?? "Erreur lors de la création"}
									</p>
								</div>
							</div>
						)}
						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-100 dark:border-gray-800">
							<button
								type="submit"
								disabled={
									(isEditMode && updateMutation.isPending) ??
									(!isEditMode && createMutation.isPending)
								}
								className="flex-1 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center hover:cursor-pointer text-sm sm:text-base"
							>
								{(() => {
									if (isEditMode) {
										return updateMutation.isPending ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
												Mise à jour en cours...
											</>
										) : (
											<>
												<svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
												</svg>
												Mettre à jour
											</>
										);
									} else {
										return createMutation.isPending ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
												Création en cours...
											</>
										) : (
											<>
												<svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
								className="flex-1 sm:flex-initial bg-white/80 dark:bg-gray-800 text-slate-700 dark:text-gray-200 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all duration-200 flex items-center justify-center hover:cursor-pointer text-sm sm:text-base"
							>
								<svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
								Annuler
							</button>
						</div>
					</form>
				</div>
				<div className="mt-4 sm:mt-6 text-center">
					<p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm">
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
