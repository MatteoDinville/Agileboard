import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const InvitationsSkeleton: React.FC = () => {
	return (
		<SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.2}>
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
						<div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
							<div className="flex items-center space-x-3 flex-1">
								<div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
									<Skeleton circle width={20} height={20} />
								</div>
								<div className="flex-1">
									<Skeleton width={180} height={16} className="mb-2" />
									<div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
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
							
							<div className="flex items-center gap-3">
								<Skeleton width={80} height={20} className="rounded-full" />
								<div className="flex gap-2">
									<Skeleton width={32} height={32} className="rounded-md" />
									<Skeleton width={32} height={32} className="rounded-md" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</SkeletonTheme>
	);
};

export default InvitationsSkeleton;
