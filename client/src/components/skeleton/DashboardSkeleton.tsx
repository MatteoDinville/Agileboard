import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const DashboardSkeleton: React.FC = () => {
	return (
		<SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
				{/* Header skeleton */}
				<header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center h-16">
							<div className="flex items-center space-x-3">
								<Skeleton width={32} height={32} className="rounded-lg" />
								<Skeleton width={100} height={24} />
							</div>
							<div className="flex items-center space-x-4">
								<Skeleton width={40} height={40} className="rounded-lg" />
								<Skeleton width={40} height={40} className="rounded-lg" />
								<Skeleton width={120} height={40} className="rounded-lg" />
							</div>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Welcome Card skeleton */}
					<div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 p-8 mb-8 border border-gray-100">
						<div className="flex items-center space-x-4 mb-6">
							<Skeleton width={64} height={64} className="rounded-full" />
							<div>
								<Skeleton width={250} height={32} className="mb-2" />
								<Skeleton width={200} height={20} />
							</div>
						</div>

						{/* Quick Stats Grid skeleton */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							{Array.from({ length: 4 }).map((_, index) => (
								<div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<Skeleton width={120} height={16} className="mb-2" />
											<Skeleton width={60} height={36} className="mb-1" />
											<Skeleton width={100} height={12} />
										</div>
										<Skeleton width={48} height={48} className="rounded-lg" />
									</div>
								</div>
							))}
						</div>

						{/* Navigation Cards skeleton */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{Array.from({ length: 3 }).map((_, index) => (
								<div key={index} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 shadow-lg">
									<div className="flex items-center space-x-4 mb-4">
										<Skeleton width={48} height={48} className="rounded-xl" />
										<div className="flex-1">
											<Skeleton width={120} height={24} className="mb-2" />
											<Skeleton width={180} height={16} />
										</div>
									</div>
									<Skeleton width="100%" height={40} className="rounded-lg" />
								</div>
							))}
						</div>
					</div>

					{/* Activity Section skeleton */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Recent Activity */}
						<div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
							<div className="flex items-center space-x-3 mb-6">
								<Skeleton width={32} height={32} className="rounded-lg" />
								<Skeleton width={150} height={24} />
							</div>
							<div className="space-y-4">
								{Array.from({ length: 4 }).map((_, index) => (
									<div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<Skeleton width={32} height={32} className="rounded-lg" />
										<div className="flex-1">
											<Skeleton width="80%" height={16} className="mb-1" />
											<Skeleton width="60%" height={14} />
										</div>
										<Skeleton width={60} height={14} />
									</div>
								))}
							</div>
						</div>

						{/* Quick Actions */}
						<div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
							<div className="flex items-center space-x-3 mb-6">
								<Skeleton width={32} height={32} className="rounded-lg" />
								<Skeleton width={150} height={24} />
							</div>
							<div className="space-y-3">
								{Array.from({ length: 5 }).map((_, index) => (
									<Skeleton key={index} width="100%" height={48} className="rounded-lg" />
								))}
							</div>
						</div>
					</div>
				</main>
			</div>
		</SkeletonTheme>
	);
};

export default DashboardSkeleton;
