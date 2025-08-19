import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface ProjectCardSkeletonProps {
	viewMode: 'list' | 'grid';
	count?: number;
}

const ProjectCardSkeleton: React.FC<ProjectCardSkeletonProps> = ({ viewMode, count = 3 }) => {
	const CardSkeleton = () => (
		<SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
			<div className={`bg-white rounded-2xl shadow-xl border-2 border-gray-200/60 ${viewMode === "list" ? "p-4 sm:p-6 lg:p-8" : "p-4 sm:p-6 lg:p-7"}`}>
				{viewMode === "grid" ? (
					<>
						{/* En-tête avec icône et actions */}
						<div className="flex items-start justify-between mb-4 sm:mb-6">
							<Skeleton width={32} height={32} className="rounded-lg" />
							<div className="flex items-center space-x-1">
								<Skeleton width={32} height={32} className="rounded-lg" />
								<Skeleton width={32} height={32} className="rounded-lg" />
								<Skeleton width={32} height={32} className="rounded-lg" />
							</div>
						</div>

						{/* Titre et description */}
						<div className="mb-4 sm:mb-6">
							<Skeleton height={24} className="mb-2 sm:mb-3" />
							<Skeleton count={3} height={16} className="mb-1" />
						</div>

						{/* Badges de statut */}
						<div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
							<Skeleton width={80} height={24} className="rounded-full" />
							<Skeleton width={90} height={24} className="rounded-full" />
							<Skeleton width={70} height={24} className="rounded-full" />
						</div>

						{/* Date de modification */}
						<div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-100">
							<div className="flex items-center space-x-1 sm:space-x-2">
								<Skeleton width={24} height={24} className="rounded-lg" />
								<Skeleton width={80} height={16} />
							</div>
						</div>
					</>
				) : (
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
						<div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
							<Skeleton width={32} height={32} className="rounded-lg" />
							<div className="flex-1 min-w-0">
								{/* Titre */}
								<Skeleton height={24} className="mb-2" />
								{/* Description */}
								<Skeleton count={2} height={16} className="mb-3 sm:mb-4" />

								{/* Badges */}
								<div className="flex flex-wrap gap-2 sm:gap-3">
									<Skeleton width={100} height={24} className="rounded-full" />
									<Skeleton width={110} height={24} className="rounded-full" />
									<Skeleton width={90} height={24} className="rounded-full" />
								</div>
							</div>
						</div>

						{/* Actions et date */}
						<div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end space-x-1 sm:space-x-0 sm:space-y-3 sm:ml-4">
							<div className="flex items-center space-x-1 sm:space-x-2">
								<Skeleton width={24} height={24} className="rounded-lg" />
								<Skeleton width={100} height={16} />
							</div>
							<div className="flex items-center space-x-1">
								<Skeleton width={32} height={32} className="rounded-lg" />
								<Skeleton width={32} height={32} className="rounded-lg" />
								<Skeleton width={32} height={32} className="rounded-lg" />
							</div>
						</div>
					</div>
				)}
			</div>
		</SkeletonTheme>
	);

	return (
		<div className={
			viewMode === "grid"
				? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
				: "space-y-4 sm:space-y-6"
		}>
			{Array.from({ length: count }).map((_, index) => (
				<CardSkeleton key={index} />
			))}
		</div>
	);
};

export default ProjectCardSkeleton;
