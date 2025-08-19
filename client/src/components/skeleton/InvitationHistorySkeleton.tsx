import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const InvitationHistorySkeleton: React.FC = () => {
	return (
		<SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.2}>
			<div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
				<div className="flex items-center space-x-3 mb-4">
					<div className="w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
						<Skeleton circle width={16} height={16} />
					</div>
					<div>
						<Skeleton width={180} height={20} className="mb-1" />
						<Skeleton width={140} height={16} />
					</div>
				</div>

				{/* Onglets skeleton */}
				<div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
					{[1, 2, 3].map((index) => (
						<div key={index} className={`flex-1 px-3 py-2 rounded-md text-center ${index === 1 ? 'bg-white shadow-sm' : ''}`}>
							<Skeleton width={80} height={16} className="mx-auto" />
						</div>
					))}
				</div>

				{/* Contenu skeleton */}
				<div className="space-y-3">
					{[1, 2, 3].map((index) => (
						<div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
							<div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
								<Skeleton circle width={20} height={20} />
							</div>
							<div className="flex-1 min-w-0">
								<Skeleton width="75%" height={16} className="mb-1" />
								<div className="flex items-center space-x-4">
									<div className="flex items-center space-x-1">
										<Skeleton circle width={12} height={12} />
										<Skeleton width={100} height={12} />
									</div>
									<div className="flex items-center space-x-1">
										<Skeleton circle width={12} height={12} />
										<Skeleton width={80} height={12} />
									</div>
								</div>
							</div>
							<div className="text-right flex-shrink-0">
								<Skeleton width={60} height={20} className="mb-1 rounded-full" />
								<Skeleton width={80} height={14} />
							</div>
						</div>
					))}
				</div>

				{/* Message vide si aucune donnée */}
				<div className="text-center py-8 opacity-50">
					<div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
						<Skeleton circle width={32} height={32} />
					</div>
					<Skeleton width={160} height={16} className="mx-auto mb-1" />
					<Skeleton width={220} height={14} className="mx-auto" />
				</div>
			</div>
		</SkeletonTheme>
	);
};

export default InvitationHistorySkeleton;
