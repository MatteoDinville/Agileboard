import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MembersListSkeleton: React.FC = () => {
	return (
		<SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.2}>
			<div className="space-y-6">
				{/* Invitations en attente skeleton */}
				<div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
					<div className="flex items-center space-x-3 mb-4">
						<div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
							<Skeleton circle width={16} height={16} />
						</div>
						<div>
							<Skeleton width={160} height={20} className="mb-1" />
							<Skeleton width={200} height={16} />
						</div>
					</div>

					<div className="space-y-3">
						{[1, 2].map((index) => (
							<div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
								<div className="flex items-center space-x-3 flex-1">
									<Skeleton circle width={32} height={32} />
									<div className="flex-1">
										<Skeleton width={180} height={16} className="mb-1" />
										<div className="flex items-center space-x-4">
											<div className="flex items-center space-x-1">
												<Skeleton circle width={12} height={12} />
												<Skeleton width={120} height={12} />
											</div>
											<div className="flex items-center space-x-1">
												<Skeleton circle width={12} height={12} />
												<Skeleton width={80} height={12} />
											</div>
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Skeleton width={60} height={16} className="rounded-full" />
									<div className="flex gap-1">
										<Skeleton width={32} height={32} className="rounded-md" />
										<Skeleton width={32} height={32} className="rounded-md" />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Section membres */}
				<div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
								<Skeleton circle width={16} height={16} />
							</div>
							<div>
								<Skeleton width={120} height={20} className="mb-1" />
								<Skeleton width={150} height={16} />
							</div>
						</div>
						<Skeleton width={100} height={36} className="rounded-lg" />
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{[1, 2, 3, 4, 5].map((index) => (
							<div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all">
								<div className="flex items-center space-x-3 mb-3">
									<div className="relative">
										<Skeleton circle width={40} height={40} />
										{index === 1 && (
											<div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white">
												<Skeleton circle width={8} height={8} />
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<Skeleton width="90%" height={16} className="mb-1" />
										<Skeleton width="70%" height={14} />
									</div>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Skeleton width={60} height={20} className="rounded-full" />
										{index <= 2 && (
											<Skeleton width={40} height={20} className="rounded-full" />
										)}
									</div>
									{index > 2 && (
										<div className="flex items-center space-x-1">
											<Skeleton circle width={24} height={24} />
											<Skeleton circle width={24} height={24} />
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Historique des invitations skeleton */}
				<div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
					<div className="flex items-center space-x-3 mb-4">
						<div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
							<Skeleton circle width={16} height={16} />
						</div>
						<div>
							<Skeleton width={180} height={20} className="mb-1" />
							<Skeleton width={140} height={16} />
						</div>
					</div>

					{/* Onglets */}
					<div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
						{[1, 2, 3].map((index) => (
							<div key={index} className={`flex-1 px-3 py-2 rounded-md ${index === 1 ? 'bg-white shadow-sm' : ''}`}>
								<Skeleton width={80} height={16} className="mx-auto" />
							</div>
						))}
					</div>

					{/* Contenu historique */}
					<div className="space-y-3">
						{[1, 2, 3].map((index) => (
							<div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
								<Skeleton circle width={32} height={32} />
								<div className="flex-1">
									<Skeleton width="70%" height={16} className="mb-1" />
									<Skeleton width="50%" height={14} />
								</div>
								<div className="text-right">
									<Skeleton width={80} height={16} className="mb-1" />
									<Skeleton width={60} height={14} />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</SkeletonTheme>
	);
};

export default MembersListSkeleton;
