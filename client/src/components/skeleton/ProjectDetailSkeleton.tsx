import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProjectDetailSkeleton: React.FC = () => {
	return (
		<SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.5}>
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
				<div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
					{/* Header avec bouton retour */}
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-6">
							<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm border">
								<Skeleton circle width={20} height={20} />
								<Skeleton width={60} height={16} />
							</div>
						</div>

						{/* Titre du projet et actions */}
						<div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
							<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-3">
										<div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
											<Skeleton circle width={24} height={24} />
										</div>
										<div className="flex-1">
											<Skeleton width={280} height={28} className="mb-2" />
											<Skeleton width={150} height={16} />
										</div>
									</div>
									<Skeleton width="85%" height={18} className="mb-4" />

									{/* Badges du projet */}
									<div className="flex flex-wrap gap-2">
										<Skeleton width={80} height={24} className="rounded-full" />
										<Skeleton width={100} height={24} className="rounded-full" />
										<Skeleton width={70} height={24} className="rounded-full" />
									</div>
								</div>

								<div className="flex gap-3">
									<Skeleton width={120} height={40} className="rounded-lg" />
									<Skeleton width={100} height={40} className="rounded-lg" />
								</div>
							</div>
						</div>

						{/* Métriques rapides */}
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
							{[
								{ label: "Tâches", value: "24", color: "from-blue-500 to-blue-600" },
								{ label: "Membres", value: "8", color: "from-green-500 to-green-600" },
								{ label: "En cours", value: "12", color: "from-yellow-500 to-yellow-600" },
								{ label: "Terminées", value: "8", color: "from-purple-500 to-purple-600" }
							].map((_, index) => (
								<div key={index} className="bg-white rounded-lg shadow-sm border p-4">
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<Skeleton width={60} height={14} className="mb-2" />
											<Skeleton width={30} height={24} />
										</div>
										<div className="w-10 h-10 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200">
											<Skeleton circle width={40} height={40} />
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Navigation par onglets */}
					<div className="bg-white rounded-xl shadow-sm border mb-6">
						<div className="flex overflow-x-auto border-b border-gray-100">
							{["Vue d'ensemble", "Kanban", "Backlog", "Membres"].map((_, index) => (
								<div key={index} className={`px-6 py-4 border-b-2 ${index === 0 ? 'border-blue-500 bg-blue-50/50' : 'border-transparent'} transition-all`}>
									<div className="flex items-center gap-2">
										<Skeleton circle width={16} height={16} />
										<Skeleton width={index === 0 ? 120 : 80} height={16} />
									</div>
								</div>
							))}
						</div>

						{/* Contenu de l'onglet Overview */}
						<div className="p-6">
							<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
								{/* Section Progression */}
								<div className="xl:col-span-2 space-y-6">
									{/* Graphique de progression */}
									<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-2">
												<Skeleton circle width={24} height={24} />
												<Skeleton width={140} height={20} />
											</div>
											<Skeleton width={80} height={16} />
										</div>
										<div className="space-y-3">
											<div className="flex justify-between items-center">
												<Skeleton width={100} height={16} />
												<Skeleton width={50} height={16} />
											</div>
											<Skeleton height={8} className="rounded-full" />
											<div className="grid grid-cols-3 gap-4 mt-4">
												<div className="text-center">
													<Skeleton width={30} height={20} className="mx-auto mb-1" />
													<Skeleton width={60} height={14} className="mx-auto" />
												</div>
												<div className="text-center">
													<Skeleton width={30} height={20} className="mx-auto mb-1" />
													<Skeleton width={70} height={14} className="mx-auto" />
												</div>
												<div className="text-center">
													<Skeleton width={30} height={20} className="mx-auto mb-1" />
													<Skeleton width={80} height={14} className="mx-auto" />
												</div>
											</div>
										</div>
									</div>

									{/* Tâches récentes */}
									<div className="bg-white rounded-xl border p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-2">
												<Skeleton circle width={24} height={24} />
												<Skeleton width={130} height={20} />
											</div>
											<Skeleton width={100} height={16} />
										</div>
										<div className="space-y-3">
											{Array.from({ length: 4 }).map((_, index) => (
												<div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
													<Skeleton circle width={32} height={32} />
													<div className="flex-1 min-w-0">
														<Skeleton width="75%" height={16} className="mb-1" />
														<Skeleton width="45%" height={14} />
													</div>
													<div className="flex items-center gap-2">
														<Skeleton width={70} height={20} className="rounded-full" />
														<Skeleton width={60} height={20} className="rounded-full" />
													</div>
												</div>
											))}
										</div>
									</div>
								</div>

								{/* Sidebar */}
								<div className="space-y-6">
									{/* Section Membres */}
									<div className="bg-white rounded-xl border p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-2">
												<Skeleton circle width={24} height={24} />
												<Skeleton width={80} height={20} />
											</div>
											<Skeleton width={60} height={16} />
										</div>
										<div className="space-y-3">
											{Array.from({ length: 3 }).map((_, index) => (
												<div key={index} className="flex items-center gap-3">
													<div className="relative">
														<Skeleton circle width={40} height={40} />
														{index === 0 && (
															<div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white">
																<Skeleton circle width={12} height={12} />
															</div>
														)}
													</div>
													<div className="flex-1 min-w-0">
														<Skeleton width="80%" height={16} className="mb-1" />
														<Skeleton width="60%" height={14} />
													</div>
													<Skeleton width={50} height={20} className="rounded-full" />
												</div>
											))}
										</div>
										<div className="mt-4 pt-4 border-t border-gray-100">
											<Skeleton width={120} height={32} className="rounded-lg mx-auto" />
										</div>
									</div>

									{/* Section Activité */}
									<div className="bg-white rounded-xl border p-6">
										<div className="flex items-center gap-2 mb-4">
											<Skeleton circle width={24} height={24} />
											<Skeleton width={110} height={20} />
										</div>
										<div className="space-y-4">
											{Array.from({ length: 3 }).map((_, index) => (
												<div key={index} className="flex gap-3">
													<Skeleton circle width={28} height={28} />
													<div className="flex-1">
														<Skeleton width="90%" height={14} className="mb-1" />
														<Skeleton width="60%" height={12} />
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</SkeletonTheme>
	);
};

export default ProjectDetailSkeleton;
