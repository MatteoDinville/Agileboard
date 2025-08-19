import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProjectsListSkeleton: React.FC = () => {
	return (
		<SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.5}>
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
				{/* Header skeleton avec animation plus fluide */}
				<header className="bg-white/90 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center h-16">
							<div className="flex items-center space-x-4 flex-1 min-w-0">
								<div className="flex items-center space-x-3">
									<Skeleton width={24} height={24} className="rounded-lg" />
									<Skeleton width={100} height={20} />
								</div>
								<div className="w-px h-6 bg-gray-300 hidden sm:block"></div>
								<div className="flex items-center space-x-3 min-w-0">
									<div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
										<Skeleton circle width={20} height={20} />
									</div>
									<div className="hidden sm:block">
										<Skeleton width={120} height={18} className="mb-1" />
										<Skeleton width={80} height={14} />
									</div>
									<div className="bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 rounded-full">
										<Skeleton width={20} height={16} />
									</div>
								</div>
							</div>
							<div className="flex items-center space-x-3">
								<Skeleton circle width={32} height={32} />
								<div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg px-4 py-2">
									<Skeleton width={100} height={20} />
								</div>
							</div>
						</div>
					</div>
				</header>

				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Stats rapides en haut */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
						{[
							{ color: "from-blue-500 to-blue-600", label: "Total" },
							{ color: "from-green-500 to-green-600", label: "Actifs" },
							{ color: "from-yellow-500 to-yellow-600", label: "En cours" },
							{ color: "from-purple-500 to-purple-600", label: "Terminés" }
						].map((stat, index) => (
							<div key={index} className="bg-white rounded-xl shadow-sm border p-4">
								<div className="flex items-center justify-between">
									<div>
										<Skeleton width={60} height={14} className="mb-2" />
										<Skeleton width={30} height={24} />
									</div>
									<div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
										<Skeleton circle width={20} height={20} />
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Barre de recherche et filtres améliorée */}
					<div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
						<div className="flex flex-col lg:flex-row lg:items-center gap-4">
							<div className="relative flex-1 max-w-md">
								<div className="absolute left-3 top-1/2 transform -translate-y-1/2">
									<Skeleton circle width={20} height={20} />
								</div>
								<Skeleton height={48} className="rounded-xl" />
							</div>
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
									<Skeleton circle width={16} height={16} />
									<Skeleton width={80} height={16} />
									<Skeleton circle width={16} height={16} />
								</div>
								<div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
									<Skeleton circle width={16} height={16} />
									<Skeleton width={60} height={16} />
								</div>
								<div className="bg-blue-50 rounded-lg p-2">
									<Skeleton circle width={20} height={20} />
								</div>
							</div>
						</div>
					</div>

					{/* Projects sections skeleton */}
					<div className="space-y-8 sm:space-y-12">
						{/* Section 1 - Mes Projets */}
						<section>
							<div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
								<div className="flex items-center space-x-3">
									<Skeleton width={40} height={40} className="rounded-xl" />
									<div>
										<div className="flex items-center space-x-2">
											<Skeleton width={120} height={32} />
											<Skeleton width={30} height={24} className="rounded-full" />
										</div>
										<Skeleton width={200} height={16} className="mt-1" />
									</div>
								</div>
							</div>

							{/* Project cards skeleton - List view */}
							<div className="space-y-4 sm:space-y-6">
								{[1, 2, 3].map((index) => (
									<div
										key={index}
										className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200/60 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8"
									>
										<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
											<div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
												<Skeleton width={32} height={32} className="rounded-lg" />
												<div className="flex-1 min-w-0 space-y-3">
													<Skeleton height={28} width="70%" />
													<Skeleton height={16} width="90%" />
													<Skeleton height={16} width="60%" />
													<div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
														<Skeleton width={80} height={24} className="rounded-full" />
														<Skeleton width={70} height={24} className="rounded-full" />
														<Skeleton width={90} height={24} className="rounded-full" />
													</div>
												</div>
											</div>
											<div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end space-x-1 sm:space-x-0 sm:space-y-3 sm:ml-4">
												<Skeleton width={120} height={16} />
												<div className="flex items-center space-x-1">
													<Skeleton width={32} height={32} className="rounded-lg" />
													<Skeleton width={32} height={32} className="rounded-lg" />
													<Skeleton width={32} height={32} className="rounded-lg" />
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</section>

						{/* Section 2 - Projets Collaboratifs */}
						<section>
							<div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
								<div className="flex items-center space-x-3">
									<Skeleton width={40} height={40} className="rounded-xl" />
									<div>
										<div className="flex items-center space-x-2">
											<Skeleton width={180} height={32} />
											<Skeleton width={30} height={24} className="rounded-full" />
										</div>
										<Skeleton width={160} height={16} className="mt-1" />
									</div>
								</div>
							</div>

							{/* Project cards skeleton - List view */}
							<div className="space-y-4 sm:space-y-6">
								{[1, 2].map((index) => (
									<div
										key={index}
										className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/60 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8"
									>
										<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
											<div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
												<Skeleton width={32} height={32} className="rounded-lg" />
												<div className="flex-1 min-w-0 space-y-3">
													<Skeleton height={28} width="70%" />
													<Skeleton height={16} width="90%" />
													<Skeleton height={16} width="60%" />
													<div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
														<Skeleton width={80} height={24} className="rounded-full" />
														<Skeleton width={70} height={24} className="rounded-full" />
														<Skeleton width={90} height={24} className="rounded-full" />
													</div>
												</div>
											</div>
											<div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end space-x-1 sm:space-x-0 sm:space-y-3 sm:ml-4">
												<Skeleton width={120} height={16} />
												<div className="flex items-center space-x-1">
													<Skeleton width={32} height={32} className="rounded-lg" />
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</section>
					</div>
				</main>
			</div>
		</SkeletonTheme>
	);
};

export default ProjectsListSkeleton;
