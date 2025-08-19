import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AuthLoadingSkeleton: React.FC = () => {
	return (
		<SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.5}>
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
				<div className="text-center">
					{/* Logo skeleton */}
					<div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
						<Skeleton circle width={32} height={32} />
					</div>
					
					{/* Titre et description */}
					<div className="mb-8">
						<Skeleton width={200} height={28} className="mx-auto mb-3" />
						<Skeleton width={280} height={16} className="mx-auto" />
					</div>
					
					{/* Barre de progression animée */}
					<div className="w-64 mx-auto mb-4">
						<div className="relative">
							<div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
								<div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
							</div>
						</div>
					</div>
					
					{/* Points de chargement */}
					<div className="flex justify-center space-x-2">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className={`w-2 h-2 bg-blue-500 rounded-full animate-bounce`}
								style={{ animationDelay: `${i * 0.2}s` }}
							></div>
						))}
					</div>
					
					{/* Texte de chargement */}
					<div className="mt-6">
						<Skeleton width={160} height={14} className="mx-auto" />
					</div>
				</div>
			</div>
		</SkeletonTheme>
	);
};

export default AuthLoadingSkeleton;
